import os
from crewai import Agent
from tools import OrderSearchTool, ProductSearchTool, RevenueAnalysisTool, PolicySearchTool

def create_agents():
    """Tạo các agents cho hệ thống RAG đa sàn."""
    
    # Agent 1: Lookup Agent - Tra cứu đơn hàng & sản phẩm
    lookup_agent = Agent(
        role="Chuyên viên Tra cứu",
        goal="Tra cứu chính xác thông tin đơn hàng, sản phẩm từ tất cả các sàn thương mại điện tử",
        backstory="""Bạn là chuyên viên tra cứu dữ liệu bán hàng đa sàn. 
        Bạn có khả năng tìm kiếm nhanh thông tin đơn hàng, sản phẩm từ Shopee, TikTok Shop và P2P.
        Bạn luôn trả lời bằng tiếng Việt, rõ ràng và chi tiết.""",
        tools=[OrderSearchTool(), ProductSearchTool()],
        verbose=True,
        allow_delegation=False
    )
    
    # Agent 2: Analysis Agent - Phân tích doanh thu & xu hướng
    analysis_agent = Agent(
        role="Chuyên viên Phân tích",
        goal="Phân tích doanh thu, xu hướng bán hàng và so sánh hiệu quả giữa các sàn",
        backstory="""Bạn là chuyên gia phân tích kinh doanh thương mại điện tử.
        Bạn giỏi phân tích số liệu doanh thu, so sánh hiệu quả các kênh bán hàng,
        và đưa ra nhận xét có giá trị. Bạn luôn trả lời bằng tiếng Việt.""",
        tools=[RevenueAnalysisTool()],
        verbose=True,
        allow_delegation=False
    )
    
    # Agent 3: Policy Agent - Chính sách các sàn
    policy_agent = Agent(
        role="Chuyên viên Chính sách",
        goal="Tra cứu và giải thích chính sách, quy định của từng sàn thương mại điện tử",
        backstory="""Bạn là chuyên gia về chính sách các sàn thương mại điện tử.
        Bạn nắm rõ chính sách phí, hoàn trả, vận chuyển, khuyến mãi của Shopee, TikTok Shop và P2P.
        Bạn luôn trả lời bằng tiếng Việt, dễ hiểu.""",
        tools=[PolicySearchTool()],
        verbose=True,
        allow_delegation=False
    )
    
    # Agent 4: Manager Agent - Điều phối
    manager_agent = Agent(
        role="Quản lý Điều phối",
        goal="Phân loại câu hỏi của người dùng và điều phối đến đúng chuyên viên",
        backstory="""Bạn là quản lý điều phối của hệ thống hỗ trợ bán hàng đa sàn.
        Nhiệm vụ của bạn là hiểu câu hỏi của người dùng và giao việc cho đúng chuyên viên:
        - Câu hỏi về đơn hàng, sản phẩm → Chuyên viên Tra cứu
        - Câu hỏi về doanh thu, phân tích, so sánh → Chuyên viên Phân tích  
        - Câu hỏi về chính sách, quy định, phí → Chuyên viên Chính sách
        Bạn luôn trả lời bằng tiếng Việt.""",
        verbose=True,
        allow_delegation=True
    )
    
    return {
        "lookup": lookup_agent,
        "analysis": analysis_agent,
        "policy": policy_agent,
        "manager": manager_agent
    }
