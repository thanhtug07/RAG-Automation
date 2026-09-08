import os
import json
from typing import Type, Any, Dict, Optional, List
from crewai.tools import BaseTool
from pydantic import BaseModel, Field


def _get_data_file_path(filename: str) -> str:
    """Xác định đường dẫn tuyệt đối đến file dữ liệu trong thư mục data."""
    return os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', filename)


def _format_content_block(title: str, content: Any, indent_level: int = 0) -> str:
    """Định dạng đệ quy nội dung chính sách thành chuỗi văn bản tiếng Việt dễ đọc."""
    indent = "  " * indent_level
    if isinstance(content, str):
        return f"{indent}* **{title}**:\n{indent}  {content.strip()}"
    elif isinstance(content, (int, float, bool)):
        return f"{indent}* **{title}**: {content}"
    elif isinstance(content, list):
        items = []
        for item in content:
            if isinstance(item, dict):
                sub_lines = []
                for sub_k, sub_v in item.items():
                    sub_lines.append(_format_content_block(str(sub_k), sub_v, indent_level + 1))
                items.append("\n".join(sub_lines))
            else:
                items.append(f"{indent}  - {item}")
        return f"{indent}* **{title}**:\n" + "\n".join(items)
    elif isinstance(content, dict):
        sub_items = []
        for k, v in content.items():
            sub_items.append(_format_content_block(str(k), v, indent_level + 1))
        return f"{indent}* **{title}**:\n" + "\n".join(sub_items)
    else:
        return f"{indent}* **{title}**: {str(content)}"


class PolicySearchInput(BaseModel):
    """Schema đầu vào cho công cụ tra cứu chính sách sàn."""
    platform: str = Field(
        ...,
        description="Tên sàn thương mại điện tử cần tra cứu chính sách (ví dụ: Shopee, Lazada, Tiki, TikTok Shop)."
    )
    topic: Optional[str] = Field(
        default="general",
        description="Chủ đề chính sách cần tra cứu: 'fees' (phí sàn/hoa hồng), 'return' (đổi trả/hoàn tiền), 'shipping' (vận chuyển/giao hàng), 'violations' (vi phạm/xử phạt), 'promotions' (khuyến mãi), hoặc 'general' (toàn bộ chính sách)."
    )


class PolicySearchTool(BaseTool):
    """Công cụ tra cứu chính sách và quy định của các sàn thương mại điện tử."""
    name: str = "PolicySearchTool"
    description: str = (
        "Tra cứu thông tin chính sách và quy định bán hàng của các sàn thương mại điện tử (Shopee, Lazada, TikTok Shop, Tiki, ...). "
        "Hỗ trợ tìm kiếm theo chủ đề: fees (phí sàn), return (đổi trả), shipping (vận chuyển), "
        "violations (vi phạm/xử phạt), promotions (khuyến mãi) hoặc general (tất cả chính sách)."
    )
    args_schema: Type[BaseModel] = PolicySearchInput

    def _run(self, platform: str, topic: Optional[str] = "general", **kwargs: Any) -> str:
        """Thực thi tra cứu chính sách sàn từ tệp policies.json."""
        file_path = _get_data_file_path("policies.json")

        if not os.path.exists(file_path):
            return f"Lỗi: Không tìm thấy tệp dữ liệu chính sách tại '{file_path}'."

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError:
            return "Lỗi: Tệp dữ liệu policies.json không đúng định dạng JSON."
        except Exception as e:
            return f"Lỗi khi đọc tệp dữ liệu policies.json: {str(e)}"

        # Chuẩn hóa dữ liệu chính sách theo sàn
        platform_map: Dict[str, Any] = self._normalize_policies_data(data)
        if not platform_map:
            return "Không tìm thấy thông tin sàn này"

        # Tìm kiếm sàn phù hợp (khớp mờ, không phân biệt chữ hoa thường)
        matched_platform_name = self._find_matching_platform(platform, platform_map)
        if not matched_platform_name:
            return "Không tìm thấy thông tin sàn này"

        platform_policies = platform_map[matched_platform_name]
        topic_clean = (topic or "general").strip().lower()

        # Nếu yêu cầu 'general' hoặc để trống, trả về toàn bộ chính sách của sàn
        if topic_clean in ["general", "all", "tat_ca", ""]:
            return self._format_all_policies(matched_platform_name, platform_policies)

        # Lọc theo chủ đề cụ thể
        return self._format_topic_policy(matched_platform_name, platform_policies, topic_clean)

    def _normalize_policies_data(self, data: Any) -> Dict[str, Any]:
        """Chuẩn hóa cấu trúc dữ liệu policies thành dạng {tên_sàn: dữ_liệu_chính_sách}."""
        normalized = {}
        if isinstance(data, dict):
            # Kiểm tra nếu dict bọc trong key 'platforms' hoặc 'policies'
            if "platforms" in data and isinstance(data["platforms"], list):
                raw_list = data["platforms"]
            elif "policies" in data and isinstance(data["policies"], list):
                raw_list = data["policies"]
            else:
                # Dạng key là tên sàn: {"Shopee": {...}, "Lazada": {...}}
                return data

            for item in raw_list:
                if isinstance(item, dict):
                    name = item.get("platform") or item.get("name") or item.get("platform_name")
                    if name:
                        policies = item.get("policies") or item.get("policy") or item
                        normalized[str(name)] = policies
            return normalized

        elif isinstance(data, list):
            for item in data:
                if isinstance(item, dict):
                    name = item.get("platform") or item.get("name") or item.get("platform_name")
                    if name:
                        policies = item.get("policies") or item.get("policy") or item
                        normalized[str(name)] = policies
            return normalized

        return {}

    def _find_matching_platform(self, query: str, platform_map: Dict[str, Any]) -> Optional[str]:
        """Tìm kiếm tên sàn phù hợp bằng phương pháp khớp mờ/gần đúng."""
        query_clean = query.strip().lower()

        # 1. Tìm khớp chính xác (không phân biệt chữ hoa thường)
        for key in platform_map.keys():
            if key.strip().lower() == query_clean:
                return key

        # 2. Tìm khớp một phần (chuỗi con)
        for key in platform_map.keys():
            k_lower = key.strip().lower()
            if query_clean in k_lower or k_lower in query_clean:
                return key

        return None

    def _format_all_policies(self, platform_name: str, policies: Any) -> str:
        """Định dạng toàn bộ chính sách của sàn."""
        lines = [f"=== THÔNG TIN CHÍNH SÁCH SÀN {platform_name.upper()} ===\n"]

        if isinstance(policies, dict):
            for key, value in policies.items():
                if key.lower() in ["platform", "name", "id"]:
                    continue
                lines.append(_format_content_block(str(key), value))
                lines.append("")
        elif isinstance(policies, list):
            for item in policies:
                lines.append(f"- {item}")
        else:
            lines.append(str(policies))

        return "\n".join(lines).strip()

    def _format_topic_policy(self, platform_name: str, policies: Any, topic: str) -> str:
        """Lọc và định dạng chính sách theo chủ đề chỉ định."""
        topic_aliases = {
            "fees": ["fee", "fees", "phí", "phi", "biểu phí", "hoa hồng", "commission"],
            "return": ["return", "returns", "refund", "đổi trả", "hoàn tiền", "tra_hang", "doi_tra"],
            "shipping": ["shipping", "ship", "vận chuyển", "giao hàng", "delivery"],
            "violations": ["violation", "violations", "vi phạm", "xử phạt", "phạt", "chế tài", "penalty"],
            "promotions": ["promotion", "promotions", "khuyến mãi", "ưu đãi", "voucher", "discount"]
        }

        # Xác định nhóm alias của chủ đề cần tìm
        search_keywords = [topic]
        for canonical_topic, aliases in topic_aliases.items():
            if topic in aliases or canonical_topic == topic:
                search_keywords = aliases
                break

        if isinstance(policies, dict):
            # Tìm key trong dict khớp với từ khóa chủ đề
            matched_key = None
            for key in policies.keys():
                k_lower = key.strip().lower()
                if any(kw in k_lower for kw in search_keywords):
                    matched_key = key
                    break

            if matched_key:
                content = policies[matched_key]
                lines = [
                    f"=== CHÍNH SÁCH SÀN {platform_name.upper()} - {matched_key.upper()} ===",
                    "",
                    _format_content_block(matched_key, content)
                ]
                return "\n".join(lines)

        elif isinstance(policies, list):
            matched_items = []
            for item in policies:
                item_str = str(item)
                if any(kw in item_str.lower() for kw in search_keywords):
                    matched_items.append(item_str)
            if matched_items:
                lines = [f"=== CHÍNH SÁCH SÀN {platform_name.upper()} - CHỦ ĐỀ '{topic.upper()}' ===", ""]
                for it in matched_items:
                    lines.append(f"- {it}")
                return "\n".join(lines)

        elif isinstance(policies, str):
            if any(kw in policies.lower() for kw in search_keywords):
                return f"=== CHÍNH SÁCH SÀN {platform_name.upper()} - CHỦ ĐỀ '{topic.upper()}' ===\n\n{policies}"

        return f"Không tìm thấy thông tin chính sách về '{topic}' cho sàn {platform_name}."
