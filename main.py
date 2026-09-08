"""Multi-Platform E-Commerce RAG System
Hệ thống RAG đa sàn thương mại điện tử sử dụng CrewAI
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

def check_api_key():
    """Kiểm tra API key đã được cấu hình chưa."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_api_key_here":
        print("\n⚠️  Chưa cấu hình OPENAI_API_KEY!")
        print("Hãy tạo file .env với nội dung:")
        print("  OPENAI_API_KEY=sk-your-key-here")
        print("  OPENAI_MODEL_NAME=gpt-4o-mini")
        sys.exit(1)

def print_banner():
    """In banner chào mừng."""
    print("\n" + "="*60)
    print("🏪 HỆ THỐNG RAG ĐA SÀN THƯƠNG MẠI ĐIỆN TỬ")
    print("   Powered by CrewAI")
    print("="*60)
    print("\n📋 Các loại câu hỏi hỗ trợ:")
    print("   🔍 Tra cứu  : Đơn hàng, sản phẩm, khách hàng")
    print("   📊 Phân tích: Doanh thu, xu hướng, so sánh kênh")  
    print("   📜 Chính sách: Phí, hoàn trả, vận chuyển, vi phạm")
    print("\n💡 Ví dụ:")
    print('   - "Tra cứu đơn hàng SP001"')
    print('   - "So sánh doanh thu giữa các sàn"')
    print('   - "Chính sách hoàn trả của TikTok Shop"')
    print("\n   Gõ 'quit' hoặc 'exit' để thoát")
    print("-"*60)

def main():
    check_api_key()
    print_banner()
    
    from crew import run_query
    
    while True:
        try:
            user_input = input("\n🔸 Câu hỏi của bạn: ").strip()
            
            if not user_input:
                continue
            if user_input.lower() in ('quit', 'exit', 'q'):
                print("\n👋 Tạm biệt! Hẹn gặp lại.")
                break
            
            print("\n⏳ Đang xử lý...\n")
            result = run_query(user_input)
            
            print("\n" + "="*60)
            print("📌 KẾT QUẢ:")
            print("="*60)
            print(result)
            print("="*60)
            
        except KeyboardInterrupt:
            print("\n\n👋 Tạm biệt!")
            break
        except Exception as e:
            print(f"\n❌ Lỗi: {e}")
            print("Vui lòng thử lại với câu hỏi khác.")

if __name__ == "__main__":
    main()
