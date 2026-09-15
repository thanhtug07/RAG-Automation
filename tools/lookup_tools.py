import os
import json
from typing import Type, Any, List, Dict
from crewai.tools import BaseTool
from pydantic import BaseModel, Field


def _get_data_file_path(filename: str) -> str:
    """Xác định đường dẫn tuyệt đối đến file dữ liệu trong thư mục data."""
    return os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', filename)


def _format_currency(amount: Any) -> str:
    """Định dạng số tiền sang chuẩn tiền tệ Việt Nam (VNĐ)."""
    try:
        val = float(amount)
        return f"{int(round(val)):,}".replace(",", ".") + " VNĐ"
    except (ValueError, TypeError):
        return f"{amount} VNĐ"


class OrderSearchInput(BaseModel):
    """Schema đầu vào cho công cụ tra cứu đơn hàng."""
    query: str = Field(
        ...,
        description="Từ khóa tìm kiếm đơn hàng: mã đơn hàng (order ID), tên sàn (Shopee, Lazada, ...), trạng thái (status), hoặc tên khách hàng."
    )


class OrderSearchTool(BaseTool):
    """Công cụ tìm kiếm thông tin đơn hàng trong hệ thống thương mại điện tử."""
    name: str = "OrderSearchTool"
    description: str = (
        "Tra cứu và tìm kiếm thông tin đơn hàng theo mã đơn hàng, tên sàn thương mại điện tử, "
        "trạng thái đơn hàng hoặc tên khách hàng. Hỗ trợ tìm kiếm gần đúng, không phân biệt chữ hoa thường."
    )
    args_schema: Type[BaseModel] = OrderSearchInput

    def _run(self, query: str, **kwargs: Any) -> str:
        """Thực thi tìm kiếm đơn hàng từ tệp orders.json."""
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

        # Chuẩn hóa danh sách đơn hàng từ dữ liệu
        if isinstance(data, list):
            orders: List[Dict[str, Any]] = data
        elif isinstance(data, dict):
            orders = data.get("orders", list(data.values())[0] if data and isinstance(list(data.values())[0], list) else [])
        else:
            return "Không tìm thấy đơn hàng phù hợp"

        query_clean = query.strip().lower()
        if not query_clean:
            return "Không tìm thấy đơn hàng phù hợp"

        matches = []
        for order in orders:
            if not isinstance(order, dict):
                continue

            order_id = str(order.get("order_id") or order.get("id") or order.get("code") or "")
            platform = str(order.get("platform") or order.get("channel") or "")
            status = str(order.get("status") or "")
            
            # Xử lý tên khách hàng (chuỗi hoặc dict lồng)
            customer = order.get("customer_name") or order.get("customer") or ""
            if isinstance(customer, dict):
                customer_name = str(customer.get("name") or "")
            else:
                customer_name = str(customer)

            # Kiểm tra khớp từ khóa
            if (
                query_clean in order_id.lower()
                or query_clean in platform.lower()
                or query_clean in status.lower()
                or query_clean in customer_name.lower()
            ):
                matches.append({
                    "order_id": order_id,
                    "customer_name": customer_name,
                    "platform": platform,
                    "status": status,
                    "order_date": str(order.get("order_date") or order.get("date") or order.get("created_at") or ""),
                    "total_amount": order.get("total_amount") or order.get("total") or order.get("total_price") or 0,
                    "items": order.get("items") or order.get("products") or []
                })

        if not matches:
            return "Không tìm thấy đơn hàng phù hợp"

        # Định dạng kết quả hiển thị tiếng Việt
        output_parts = [f"Tìm thấy {len(matches)} đơn hàng phù hợp với từ khóa '{query}':\n"]
        for idx, item in enumerate(matches, 1):
            lines = [
                f"Đơn hàng #{idx}:",
                f"- Mã đơn hàng: {item['order_id']}",
                f"- Khách hàng: {item['customer_name'] or 'N/A'}",
                f"- Sàn: {item['platform'] or 'N/A'}",
                f"- Trạng thái: {item['status'] or 'N/A'}",
                f"- Ngày đặt: {item['order_date'] or 'N/A'}",
                f"- Tổng tiền: {_format_currency(item['total_amount'])}"
            ]
            if item["items"] and isinstance(item["items"], list):
                lines.append("- Chi tiết sản phẩm:")
                for prod in item["items"]:
                    if isinstance(prod, dict):
                        p_name = prod.get("product_name") or prod.get("name") or prod.get("title") or "Sản phẩm"
                        p_qty = prod.get("quantity") or prod.get("qty") or 1
                        p_price = prod.get("price") or prod.get("unit_price") or 0
                        lines.append(f"  + {p_name} | Số lượng: {p_qty} | Đơn giá: {_format_currency(p_price)}")
            output_parts.append("\n".join(lines))

        return "\n\n".join(output_parts)


class ProductSearchInput(BaseModel):
    """Schema đầu vào cho công cụ tra cứu sản phẩm."""
    query: str = Field(
        ...,
        description="Từ khóa tìm kiếm sản phẩm: tên sản phẩm (product name), danh mục (category), hoặc sàn phân phối (platform)."
    )


class ProductSearchTool(BaseTool):
    """Công cụ tìm kiếm thông tin sản phẩm trong kho đa sàn."""
    name: str = "ProductSearchTool"
    description: str = (
        "Tra cứu và tìm kiếm thông tin sản phẩm trong kho theo tên sản phẩm, danh mục hoặc sàn phân phối. "
        "Hiển thị chi tiết tồn kho và số lượng đã bán. Hỗ trợ tìm kiếm gần đúng, không phân biệt chữ hoa thường."
    )
    args_schema: Type[BaseModel] = ProductSearchInput

    def _run(self, query: str, **kwargs: Any) -> str:
        """Thực thi tìm kiếm sản phẩm từ tệp products.json."""
        file_path = _get_data_file_path("products.json")

        if not os.path.exists(file_path):
            return f"Lỗi: Không tìm thấy tệp dữ liệu sản phẩm tại '{file_path}'."

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError:
            return "Lỗi: Tệp dữ liệu products.json không đúng định dạng JSON."
        except Exception as e:
            return f"Lỗi khi đọc tệp dữ liệu products.json: {str(e)}"

        # Chuẩn hóa danh sách sản phẩm từ dữ liệu
        if isinstance(data, list):
            products: List[Dict[str, Any]] = data
        elif isinstance(data, dict):
            products = data.get("products", list(data.values())[0] if data and isinstance(list(data.values())[0], list) else [])
        else:
            return "Không tìm thấy sản phẩm phù hợp"

        query_clean = query.strip().lower()
        if not query_clean:
            return "Không tìm thấy sản phẩm phù hợp"

        matches = []
        for prod in products:
            if not isinstance(prod, dict):
                continue

            prod_id = str(prod.get("product_id") or prod.get("id") or "")
            name = str(prod.get("name") or prod.get("product_name") or prod.get("title") or "")
            category = str(prod.get("category") or prod.get("category_name") or "")

            platforms_raw = prod.get("platforms") or prod.get("platform") or []
            if isinstance(platforms_raw, list):
                platforms_str = ", ".join(str(p) for p in platforms_raw)
            else:
                platforms_str = str(platforms_raw)

            # Kiểm tra khớp từ khóa
            if (
                query_clean in name.lower()
                or query_clean in category.lower()
                or query_clean in platforms_str.lower()
            ):
                price = prod.get("price") or prod.get("sale_price") or prod.get("original_price") or 0
                stock = prod.get("stock") or prod.get("inventory") or prod.get("quantity") or 0
                sales = prod.get("sales") or prod.get("sold") or prod.get("units_sold") or 0

                matches.append({
                    "product_id": prod_id,
                    "name": name,
                    "category": category,
                    "platforms": platforms_str,
                    "price": price,
                    "stock": stock,
                    "sales": sales
                })

        if not matches:
            return "Không tìm thấy sản phẩm phù hợp"

        # Định dạng kết quả hiển thị tiếng Việt
        output_parts = [f"Tìm thấy {len(matches)} sản phẩm phù hợp với từ khóa '{query}':\n"]
        for idx, item in enumerate(matches, 1):
            lines = [
                f"Sản phẩm #{idx}:",
                f"- Mã sản phẩm: {item['product_id'] or 'N/A'}",
                f"- Tên sản phẩm: {item['name']}",
                f"- Danh mục: {item['category'] or 'N/A'}",
                f"- Sàn phân phối: {item['platforms'] or 'N/A'}",
                f"- Giá bán: {_format_currency(item['price'])}",
                f"- Tồn kho: {item['stock']}",
                f"- Đã bán: {item['sales']}"
            ]
            output_parts.append("\n".join(lines))

        return "\n\n".join(output_parts)
