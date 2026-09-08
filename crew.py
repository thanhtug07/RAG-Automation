import os
from dotenv import load_dotenv
from crewai import Crew, Task, Process
from agents import create_agents

load_dotenv()

def create_crew(user_query: str):
    """Tạo crew với câu hỏi từ user."""
    agents = create_agents()
    
    # Tạo task duy nhất - Manager sẽ tự delegate
    main_task = Task(
        description=f"""Xử lý yêu cầu sau của người dùng:
        
        \"{user_query}\"
        
        Hãy phân tích câu hỏi và sử dụng các công cụ phù hợp để trả lời.
        Trả lời bằng tiếng Việt, rõ ràng và đầy đủ.""",
        expected_output="Câu trả lời chi tiết bằng tiếng Việt cho câu hỏi của người dùng",
        agent=agents["manager"]
    )
    
    crew = Crew(
        agents=[
            agents["lookup"],
            agents["analysis"],
            agents["policy"]
        ],
        tasks=[main_task],
        manager_agent=agents["manager"],
        process=Process.hierarchical,
        verbose=True
    )
    
    return crew

def run_query(user_query: str):
    """Chạy một câu hỏi qua hệ thống."""
    crew = create_crew(user_query)
    result = crew.kickoff()
    return result
