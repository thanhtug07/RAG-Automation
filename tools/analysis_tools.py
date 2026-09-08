import os
import json
from collections import defaultdict
from typing import Type, Any, Dict, List
from crewai.tools import BaseTool
from pydantic import BaseModel, Field


def _get_data_file_path(filename: str) -> str:
    """Xác định đường dẫn tuyệt đối đến file dữ liệu trong thư mục data."""
    return os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', filename)


def _format_currency(amount: Any) -> str:
    """Định dạng số tiền sang chuẩn tiền tệ Việt Nam (VNĐ) có dấu phân cách hàng nghìn."""
    try:
        val = float(amount)
        return f"{int(round(val)):,}".replace(",", ".") + " VNĐ"
    except (ValueError, TypeError):
        return f"{amount} VNĐ"


class RevenueAnalysisInput(BaseModel):
    """Schema đầu vào cho công cụ phân tích doanh thu."""
    analysis_type: str = Field(
        ...,
        description="Loại phân tích cần thực hiện: 'by_platform' (theo sàn), 'by_date' (theo ngày), 'by_product' (theo sản phẩm), 'by_status' (theo trạng thái), hoặc 'overall' (tổng quan toàn bộ)."
    )


class RevenueAnalysisTool(BaseTool):
    """Công cụ phân tích doanh thu và số liệu kinh doanh từ dữ liệu đơn hàng."""
    name: str = "RevenueAnalysisTool"
    description: str = (
        "Phân tích doanh thu và số liệu bán hàng theo nhiều tiêu chí: "
        "theo sàn thương mại điện tử ('by_platform'), theo ngày bán ('by_date'), "
        "theo sản phẩm ('by_product'), theo trạng thái đơn hàng ('by_status'), "
        "hoặc tổng quan toàn diện ('overall')."
    )
    args_schema: Type[BaseModel] = RevenueAnalysisInput

    def _run(self, analysis_type: str, **kwargs: Any) -> str:
        """Thực thi phân tích doanh thu từ tệp orders.json."""
        file_path = _get_data_file_path("orders.json")

        if not os.path.exists(file_path):
            return f"Lỗi: Không tìm thấy tệp dữ liệu đơn hàng tại '{file_path}'."

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError:
            return "Lỗi: Tệp dữ liệu orders.json không đúng định dạng JSON."
        except Exception as e:
            return f"Lỗi khi đọc tệp dữ liệu orders.json: {str(e)}"

        # Chuẩn hóa danh sách đơn hàng
        if isinstance(data, list):
            orders: List[Dict[str, Any]] = data
        elif isinstance(data, dict):
            orders = data.get("orders", list(data.values())[0] if data and isinstance(list(data.values())[0], list) else [])
        else:
            return "Lỗi: Dữ liệu đơn hàng không hợp lệ."

        if not orders:
            return "Không có dữ liệu đơn hàng để phân tích."

        type_clean = analysis_type.strip().lower()

        if type_clean == "by_platform":
            return self._analyze_by_platform(orders)
        elif type_clean == "by_date":
            return self._analyze_by_date(orders)
        elif type_clean == "by_product":
            return self._analyze_by_product(orders)
        elif type_clean == "by_status":
            return self._analyze_by_status(orders)
        elif type_clean == "overall":
            return self._analyze_overall(orders)
        else:
            return (
                f"Loại phân tích '{analysis_type}' không hợp lệ. "
                "Vui lòng chọn một trong các loại sau: 'by_platform', 'by_date', 'by_product', 'by_status', 'overall'."
            )

    def _analyze_by_platform(self, orders: List[Dict[str, Any]]) -> str:
        """Phân tích doanh thu, số lượng đơn và giá trị trung bình đơn theo từng sàn."""
        platform_revenue = defaultdict(float)
        platform_orders = defaultdict(int)

        for order in orders:
            platform = str(order.get("platform") or order.get("channel") or "Chưa rõ sàn")
            total = float(order.get("total_amount") or order.get("total") or order.get("total_price") or 0)
            platform_revenue[platform] += total
            platform_orders[platform] += 1

        # Sắp xếp sàn theo doanh thu giảm dần
        sorted_platforms = sorted(platform_revenue.items(), key=lambda x: x[1], reverse=True)

        lines = [
            "=== BÁO CÁO DOANH THU THEO SÀN THƯƠNG MẠI ĐIỆN TỬ ===",
            f"Tổng số sàn phân phối: {len(sorted_platforms)}\n"
        ]

        for rank, (platform, rev) in enumerate(sorted_platforms, 1):
            count = platform_orders[platform]
            avg_val = rev / count if count > 0 else 0
            lines.append(f"{rank}. Sàn {platform}:")
            lines.append(f"   - Tổng doanh thu: {_format_currency(rev)}")
            lines.append(f"   - Số lượng đơn hàng: {count} đơn")
            lines.append(f"   - Giá trị trung bình/đơn (AOV): {_format_currency(avg_val)}")

        return "\n".join(lines)

    def _analyze_by_date(self, orders: List[Dict[str, Any]]) -> str:
        """Phân tích doanh thu và số lượng đơn hàng theo ngày."""
        date_revenue = defaultdict(float)
        date_orders = defaultdict(int)

        for order in orders:
            date_raw = str(order.get("order_date") or order.get("date") or order.get("created_at") or "Không rõ ngày")
            date_str = date_raw.split("T")[0].split(" ")[0]
            total = float(order.get("total_amount") or order.get("total") or order.get("total_price") or 0)
            date_revenue[date_str] += total
            date_orders[date_str] += 1

        sorted_dates = sorted(date_revenue.keys())

        lines = [
            "=== BÁO CÁO DOANH THU THEO NGÀY ===",
            f"Tổng số ngày ghi nhận: {len(sorted_dates)}\n"
        ]

        for date_val in sorted_dates:
            rev = date_revenue[date_val]
            count = date_orders[date_val]
            lines.append(f"- Ngày {date_val}:")
            lines.append(f"  + Doanh thu: {_format_currency(rev)}")
            lines.append(f"  + Số lượng đơn hàng: {count} đơn")

        return "\n".join(lines)

    def _analyze_by_product(self, orders: List[Dict[str, Any]]) -> str:
        """Phân tích doanh thu và số lượng bán theo từng sản phẩm."""
        product_revenue = defaultdict(float)
        product_quantity = defaultdict(int)

        for order in orders:
            items = order.get("items") or order.get("products") or []
            if items and isinstance(items, list):
                for item in items:
                    if isinstance(item, dict):
                        p_name = item.get("product_name") or item.get("name") or item.get("title") or "Sản phẩm khác"
                        qty = int(item.get("quantity") or item.get("qty") or 1)
                        price = float(item.get("price") or item.get("unit_price") or 0)
                        item_total = float(item.get("total") or item.get("total_price") or (qty * price))
                        product_revenue[p_name] += item_total
                        product_quantity[p_name] += qty
            else:
                p_name = order.get("product_name") or order.get("product") or "Sản phẩm chung"
                qty = int(order.get("quantity") or 1)
                item_total = float(order.get("total_amount") or order.get("total") or 0)
                product_revenue[p_name] += item_total
                product_quantity[p_name] += qty

        # Sắp xếp sản phẩm theo doanh thu giảm dần
        sorted_products = sorted(product_revenue.items(), key=lambda x: x[1], reverse=True)

        lines = [
            "=== BÁO CÁO DOANH THU THEO SẢN PHẨM ===",
            f"Tổng số mặt hàng đã bán: {len(sorted_products)}\n"
        ]

        for rank, (prod, rev) in enumerate(sorted_products, 1):
            qty = product_quantity[prod]
            lines.append(f"{rank}. {prod}:")
            lines.append(f"   - Doanh thu: {_format_currency(rev)}")
            lines.append(f"   - Số lượng đã bán: {qty}")

        return "\n".join(lines)

    def _analyze_by_status(self, orders: List[Dict[str, Any]]) -> str:
        """Phân tích số lượng đơn hàng và doanh thu theo trạng thái."""
        status_count = defaultdict(int)
        status_revenue = defaultdict(float)
        total_orders = len(orders)

        for order in orders:
            status = str(order.get("status") or "Chưa rõ")
            total = float(order.get("total_amount") or order.get("total") or order.get("total_price") or 0)
            status_count[status] += 1
            status_revenue[status] += total

        sorted_status = sorted(status_count.items(), key=lambda x: x[1], reverse=True)

        lines = [
            "=== BÁO CÁO ĐƠN HÀNG THEO TRẠNG THÁI ===",
            f"Tổng số đơn hàng: {total_orders} đơn\n"
        ]

        for status, count in sorted_status:
            percentage = (count / total_orders * 100) if total_orders > 0 else 0
            rev = status_revenue[status]
            lines.append(f"- Trạng thái '{status}':")
            lines.append(f"  + Số lượng: {count} đơn ({percentage:.1f}%)")
            lines.append(f"  + Tổng giá trị đơn: {_format_currency(rev)}")

        return "\n".join(lines)

    def _analyze_overall(self, orders: List[Dict[str, Any]]) -> str:
        """Phân tích tổng quan: tổng doanh thu, tổng số đơn, giá trị trung bình, sàn tốt nhất."""
        total_orders = len(orders)
        grand_total_revenue = 0.0
        platform_revenue = defaultdict(float)

        for order in orders:
            total = float(order.get("total_amount") or order.get("total") or order.get("total_price") or 0)
            grand_total_revenue += total
            platform = str(order.get("platform") or order.get("channel") or "Khác")
            platform_revenue[platform] += total

        avg_order_value = grand_total_revenue / total_orders if total_orders > 0 else 0.0

        if platform_revenue:
            best_platform, best_revenue = max(platform_revenue.items(), key=lambda x: x[1])
            best_platform_info = f"{best_platform} ({_format_currency(best_revenue)})"
        else:
            best_platform_info = "Không xác định"

        lines = [
            "=== BÁO CÁO TỔNG QUAN DOANH THU TOÀN DIỆN ===",
            f"- Tổng doanh thu: {_format_currency(grand_total_revenue)}",
            f"- Tổng số đơn hàng: {total_orders} đơn",
            f"- Giá trị đơn hàng trung bình (AOV): {_format_currency(avg_order_value)}",
            f"- Sàn có doanh thu cao nhất: {best_platform_info}"
        ]

        return "\n".join(lines)
