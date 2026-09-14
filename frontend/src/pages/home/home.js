// Home interactions — local mock data only. No backend, no auth, no API calls.
(function () {
  "use strict";

  // Mock workspace state (presentation only).
  var mockWorkspace = {
    status: "running",
    progress: 72,
    agents: 12,
    toolCalls: 48,
    sources: 126
  };

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canObserve = "IntersectionObserver" in window;

  // 0. i18n — EN/VI dictionary + switcher. Persists in localStorage key
  // agentos.lang (default "en"); <html lang> is pre-set by the inline head
  // init so restore happens before first paint. Every user-visible string
  // is keyed here; static markup binds via data-i18n / data-i18n-html /
  // data-i18n-aria-label / data-i18n-title, dynamic strings via t().
  var I18N = {
    en: {
      "meta.title": "AgentOS — Turn business intent into autonomous execution",
      "meta.description": "AgentOS plans business requests, orchestrates specialized AI agents over enterprise knowledge and tools, and delivers traceable results.",
      "skip": "Skip to content",
      "nav.brand_aria": "AgentOS home",
      "nav.aria": "Primary",
      "nav.platform": "Platform",
      "nav.how": "How it works",
      "nav.capabilities": "Capabilities",
      "nav.trust": "Trust",
      "nav.signin": "Sign in",
      "nav.getstarted": "Get started",
      "nav.menu_open": "Open menu",
      "nav.menu_close": "Close menu",
      "hero.eyebrow": "Enterprise AI Automation",
      "hero.title": "<span class=\"Hero-line\" style=\"display:block\"><span style=\"display:block\">Turn business intent</span></span><span class=\"Hero-line\" style=\"display:block\"><span style=\"display:block\">into autonomous execution.</span></span>",
      "hero.lead": "Finance and ops teams turn one request into a traced, board-ready report. Enterprise automation with plans, specialist agents, and approvals — every step traceable.",
      "hero.cta_primary": "Start building",
      "hero.cta_secondary": "Explore AgentOS <span aria-hidden=\"true\">→</span>",
      "hero.note": "Sample run · 12 agents · every step traceable · no credit card",
      "hero.bg_aria": "Hero background",
      "preview.eyebrow": "01 · Live execution",
      "preview.title": "Watch a request become a result",
      "preview.aria": "AgentOS workspace preview, sample run",
      "preview.window": "AgentOS Workspace",
      "preview.status_running": "● Running",
      "preview.gate": "Pause anytime · approval required to publish",
      "preview.request_label": "Request",
      "preview.request_text": "Analyze Q2 market performance and prepare an executive report",
      "preview.request_meta": "Owner: Finance · 6 steps · approvals on",
      "preview.activity": "Activity",
      "feed.1": "Planner approved 6-step plan <em>✓ Completed</em>",
      "feed.2": "Research Agent scanned 74 sources <em>✓ Completed</em>",
      "feed.3": "Knowledge Agent cited 52 policy docs <em>✓ Completed</em>",
      "feed.4": "Data Agent querying revenue tables <em>● Running</em>",
      "feed.5": "Data Agent revenue query failed (stale filter) → retried with corrected filter <em>↻ Retried</em>",
      "feed.6": "Synthesis merging verified findings <em>● Running</em>",
      "feed.show_all": "Show all ({n} events)",
      "feed.show_less": "Show less",
      "preview.graph_title": "Execution graph · 3 featured agents of 12 in workspace",
      "preview.run_aria": "Run summary: status, owner, next action",
      "run.status_label": "Status",
      "run.status_val": "● Running · 72% complete",
      "run.owner_label": "Owner",
      "run.owner_val": "Finance",
      "run.next_label": "Next action",
      "run.next_val": "Data Agent finishes query → Synthesis approval",
      "graph.hide": "Hide full execution graph",
      "graph.show": "Show full execution graph (6 steps, 3 featured agents)",
      "preview.scroll_aria": "Execution graph diagram, scroll horizontally on small screens",
      "preview.graph_aria": "Agent execution graph: Planner, then Research, Data and Knowledge agents in parallel, then Synthesis, then Result",
      "preview.fan_aria": "Parallel agents: Research, Data, Knowledge",
      "node.planner_detail": "6 steps · plan approved",
      "node.research_detail": "Web Search · 74 sources",
      "node.data_detail": "SQL warehouse · revenue",
      "node.knowledge_detail": "Policy base · 52 docs",
      "node.synthesis_detail": "Merging verified findings",
      "node.validation": "Validation",
      "node.validation_detail": "Cross-check figures · queued",
      "node.result": "Result",
      "node.result_detail": "Executive report · draft",
      "state.completed": "✓ Completed",
      "state.running": "● Running",
      "state.pending": "○ Pending",
      "preview.metrics_aria": "Sample run totals",
      "metrics.agents": "Agents in workspace",
      "metrics.tools": "Tool calls",
      "metrics.sources": "Sources",
      "metrics.complete": "Complete",
      "preview.metrics_note": "Sample run totals — graph shows 3 featured specialists of the 12-agent workspace.",
      "preview.progress_aria": "Workspace progress",
      "orch.eyebrow": "02 · Orchestration",
      "orch.title": "One goal, many agents, a single verified result",
      "orch.lead": "The orchestrator decomposes the goal, runs specialists in parallel, then synthesizes only validated findings.",
      "orch.hint": "Scrollable diagram — swipe or Tab to the flow, then use arrow keys to explore &rarr;",
      "orch.scroll_aria": "Orchestration flow diagram, scroll horizontally",
      "orch.flow_aria": "Orchestration flow for Q2 Revenue Analysis: goal, plan, parallel specialists, validated merge, result",
      "orch.goal_kicker": "Business objective",
      "orch.goal_title": "Q2 Revenue Analysis",
      "orch.goal_sub": "Owner: Finance · due Friday",
      "orch.plan_kicker": "Orchestrator",
      "orch.plan_title": "Plan: 6 steps",
      "orch.plan_sub": "Routes · retries · approvals",
      "orch.agents_aria": "Three specialist agents in parallel",
      "orch.agents_kicker": "Specialists · parallel",
      "orch.tip_research": "Research agent — Web Search over 74 sources, completed",
      "orch.tip_data": "Data agent — SQL warehouse revenue tables, running",
      "orch.tip_knowledge": "Knowledge agent — policy base over 52 docs, completed",
      "orch.tool_research": "Web Search · 74 sources",
      "orch.tool_data": "SQL warehouse · revenue tables",
      "orch.tool_knowledge": "Policy base · 52 docs",
      "orch.synth_kicker": "Synthesis + validation",
      "orch.synth_title": "Validated merge",
      "orch.synth_sub": "Figures cross-checked · conflicts flagged, not hidden",
      "orch.result_kicker": "Final result",
      "orch.result_title": "Board-ready report",
      "orch.result_sub": "Every claim cites its source",
      "orch.legend_aria": "Border color legend: Goal black, Plan blue, Parallel light blue, Validated merge purple, Result green",
      "legend.goal": "Goal",
      "legend.plan": "Plan",
      "legend.parallel": "Parallel",
      "legend.merge": "Validated merge",
      "legend.result": "Result",
      "stack.title": "Works with your stack",
      "stack.line": "PostgreSQL · Slack · Salesforce · GitHub · S3 — connects via standard connectors and APIs. Every call is logged.",
      "how.eyebrow": "03 · Process",
      "how.title": "How AgentOS works",
      "how.lead": "Five stages from request to delivered outcome — one connected flow.",
      "how.flow_aria": "AgentOS process flow",
      "how.k1": "01 · Understand ✓ Completed",
      "how.t1": "Understand",
      "how.p1": "AgentOS clarifies the request, the success criteria, and what approval each step needs.",
      "how.k2": "02 · Plan ✓ Completed",
      "how.t2": "Plan",
      "how.p2": "The planner breaks the goal into steps and assigns each to the right specialist agent.",
      "how.k3": "03 · Execute ● Running",
      "how.t3": "Execute — parallel agents",
      "how.p3": "Agents work over approved knowledge and business tools, with progress visible throughout.",
      "how.branch_aria": "Execute branch: Research and Data agents working in parallel",
      "how.tip_research": "Research branch — Web Search, completed",
      "how.tip_data": "Data branch — SQL warehouse, running",
      "how.branch_research": "Web Search · ✓ Completed",
      "how.branch_data": "SQL warehouse · ● Running",
      "how.k4": "04 · Validate ○ Pending",
      "how.t4": "Validate",
      "how.p4": "Figures are cross-checked against sources. Conflicts are flagged, not hidden.",
      "how.retry": "<strong>Retry shown:</strong> Data Agent revenue query failed once (stale filter) → retried with corrected filter → flagged in log as <em>● Retried</em>.",
      "how.k5": "05 · Deliver ○ Pending",
      "how.t5": "Deliver",
      "how.p5": "Validated findings merge into a finished result, traced back to every source and action.",
      "how.recap": "Request → verified result in 5 auditable stages.",
      "cap.eyebrow": "04 · Capabilities",
      "cap.title": "Built for work that has to hold up",
      "cap.lead": "Coordination, visibility, knowledge, and tools in one controlled workspace.",
      "cap.lead_h": "Get verified results faster — multi-agent orchestration",
      "cap.lead_p": "Decompose a business goal into a supervised plan. Specialists run in parallel, the orchestrator handles ordering, retries, and handoffs — so twelve agents feel like one team.",
      "cap.lead_li1": "Parallel specialists with clear ownership",
      "cap.lead_li2": "Ordered handoffs: plan → execute → validate → synthesize",
      "cap.lead_li3": "Human approval gates where they matter",
      "cap.vis_h": "Trust every step — execution visibility",
      "cap.vis_p": "Follow every run node by node. Status is always stated in words — ● Running, ✓ Completed, ○ Pending — never color alone.",
      "cap.know_h": "Answers with proof — enterprise knowledge",
      "cap.know_p": "Ground agents in approved documents and policies. Each answer carries the sources it used.",
      "cap.tools_h": "Work where work happens — business tools",
      "cap.tools_p": "Connect the warehouse, the CRM, and internal APIs. Every tool call is logged with its inputs and result.",
      "tabs.title": "See it on a real request",
      "tabs.aria": "Use cases",
      "tabs.market": "Q2 Market Intel",
      "tabs.revenue": "Revenue Review",
      "tabs.triage": "Ticket Triage",
      "tabs.ops": "Ops On-call",
      "panel.market_copy": "Scan filings, cite policy docs, and draft the executive section with sources attached.",
      "panel.revenue_copy": "Query warehouse tables, verify figures, and flag variances for Finance approval.",
      "panel.triage_copy": "Classify incoming tickets, set priority, and route to the right owner with context.",
      "panel.ops_copy": "Page the right responder, attach runbooks, and keep a timeline the whole team can follow.",
      "panel.m_market_sources": "Sources scanned <span class=\"SampleTag\">sample</span>",
      "panel.m_market_docs": "Docs cited <span class=\"SampleTag\">sample</span>",
      "panel.m_market_steps": "Plan steps <span class=\"SampleTag\">sample</span>",
      "panel.m_rev_tables": "Tables queried <span class=\"SampleTag\">sample</span>",
      "panel.m_rev_figures": "Figures verified <span class=\"SampleTag\">sample</span>",
      "panel.m_rev_var": "Variances flagged <span class=\"SampleTag\">sample</span>",
      "panel.m_tri_tickets": "Tickets classified <span class=\"SampleTag\">sample</span>",
      "panel.m_tri_queues": "Queues routed <span class=\"SampleTag\">sample</span>",
      "panel.m_tri_owners": "Owners assigned <span class=\"SampleTag\">sample</span>",
      "panel.m_ops_inc": "Incidents paged <span class=\"SampleTag\">sample</span>",
      "panel.m_ops_books": "Runbooks attached <span class=\"SampleTag\">sample</span>",
      "panel.m_ops_ack": "Median ack <span class=\"SampleTag\">sample</span>",
      "panel.next_audit": "See how runs stay auditable <span aria-hidden=\"true\">→</span>",
      "panel.next_controls": "See approval controls <span aria-hidden=\"true\">→</span>",
      "trust.eyebrow": "05 · Control",
      "trust.title": "Control is part of the product",
      "trust.lead": "Autonomy you can audit — what we commit to today.",
      "trust.vis_h": "Visibility",
      "trust.vis_p": "Watch plans, agent states, tool calls, and progress as they happen. Nothing executes off-screen.",
      "trust.timeline_aria": "Sample run timeline",
      "trust.tl1": "Plan approved <em>✓ Completed</em>",
      "trust.tl2": "Data Agent · SQL query <em>● Running</em>",
      "trust.tl3": "Synthesis queued <em>○ Pending</em>",
      "trust.ctl_h": "Control",
      "trust.ctl_p": "Require approval before sensitive steps, pause or cancel a run at any point, and set which tools each agent may touch.",
      "trust.gate_aria": "Approval gate sample",
      "trust.gate_title": "Approval gate · publish report",
      "trust.pause": "Pause",
      "trust.resume": "Resume",
      "trust.cancel": "Cancel",
      "trust.gate_waiting": "Waiting on Finance owner.",
      "trust.gate_paused": "Paused by Finance owner. Resume any time.",
      "trust.gate_cancelled": "Cancel requested. Run will stop after the current tool call.",
      "trust.tr_h": "Traceability",
      "trust.tr_p": "Every result links back to the sources, tool calls, and decisions that produced it — replayable in the activity log.",
      "trust.map_aria": "Source mapping sample",
      "trust.map1t": "Report §2 · revenue +8%",
      "trust.map1d": "SQL warehouse · q2_revenue.sql ✓ Verified",
      "trust.map2t": "Report §3 · market share",
      "trust.map2d": "Web Search · 74 filings ✓ Verified",
      "cta.eyebrow": "06 · Result",
      "cta.title": "Bring your next business goal.<br />Leave with an executed result.",
      "cta.lead": "Start with a real request — Q2 Market Intelligence, Revenue Analysis, policy review — and watch AgentOS plan, orchestrate, and deliver.",
      "cta.demo_aria": "Sample run preview",
      "cta.goal": "“Analyze Q2 market performance and prepare an executive report.”",
      "cta.step1": "Research <span>✓ Completed</span>",
      "cta.step2": "Analysis <span>✓ Completed</span>",
      "cta.step3": "Knowledge <span>✓ Completed</span>",
      "cta.step4": "Report <span>● Running</span>",
      "cta.replay": "Replay run",
      "cta.path_free": "free workspace",
      "cta.path_existing": "existing workspace",
      "cta.micro": "No credit card · cancel run anytime",
      "deploy.title": "Deploy your way",
      "deploy.self_h": "Self-host",
      "deploy.self_p": "Run in your own data center.",
      "deploy.vpc_p": "Run isolated in your cloud account.",
      "deploy.cloud_h": "Cloud",
      "deploy.cloud_p": "Managed workspace to start fast.",
      "deploy.audit_label": "Audit log · ",
      "deploy.copy": "Copy",
      "deploy.copied": "Copied",
      "deploy.copy_failed": "Copy failed — select the line manually",
      "footer.tag": "AgentOS. Enterprise AI Automation.",
      "footer.aria": "Footer",
      "footer.sample": "Sample run",
      "footer.openapp": "Open app"
    },
    vi: {
      "meta.title": "AgentOS — Biến ý định kinh doanh thành thực thi tự động",
      "meta.description": "AgentOS lập kế hoạch cho yêu cầu kinh doanh, điều phối các agent AI chuyên trách trên tri thức và công cụ doanh nghiệp, và bàn giao kết quả có thể truy vết.",
      "skip": "Bỏ qua tới nội dung",
      "nav.brand_aria": "Trang chủ AgentOS",
      "nav.aria": "Điều hướng chính",
      "nav.platform": "Nền tảng",
      "nav.how": "Cách hoạt động",
      "nav.capabilities": "Tính năng",
      "nav.trust": "Kiểm soát",
      "nav.signin": "Đăng nhập",
      "nav.getstarted": "Bắt đầu ngay",
      "nav.menu_open": "Mở menu",
      "nav.menu_close": "Đóng menu",
      "hero.eyebrow": "Tự động hoá AI cho doanh nghiệp",
      "hero.title": "<span class=\"Hero-line\" style=\"display:block\"><span style=\"display:block\">Biến ý định kinh doanh</span></span><span class=\"Hero-line\" style=\"display:block\"><span style=\"display:block\">thành thực thi tự động.</span></span>",
      "hero.lead": "Đội ngũ tài chính và vận hành biến một yêu cầu thành báo cáo sẵn sàng trình bày, có truy vết đầy đủ. Tự động hoá doanh nghiệp với kế hoạch, agent chuyên trách và phê duyệt — mọi bước đều truy vết được.",
      "hero.cta_primary": "Bắt đầu xây dựng",
      "hero.cta_secondary": "Khám phá AgentOS <span aria-hidden=\"true\">→</span>",
      "hero.note": "Bản chạy mẫu · 12 agent · mọi bước đều truy vết · không cần thẻ tín dụng",
      "hero.bg_aria": "Nền phần giới thiệu",
      "preview.eyebrow": "01 · Thực thi trực tiếp",
      "preview.title": "Xem một yêu cầu trở thành kết quả",
      "preview.window": "AgentOS Workspace",
      "preview.status_running": "● Đang chạy",
      "preview.gate": "Tạm dừng bất cứ lúc nào · cần phê duyệt để xuất bản",
      "preview.request_label": "Yêu cầu",
      "preview.request_text": "Phân tích hiệu quả thị trường Q2 và chuẩn bị báo cáo điều hành",
      "preview.request_meta": "Phụ trách: Tài chính · 6 bước · bật phê duyệt",
      "preview.activity": "Hoạt động",
      "feed.1": "Planner đã duyệt kế hoạch 6 bước <em>✓ Hoàn thành</em>",
      "feed.2": "Research Agent đã quét 74 nguồn <em>✓ Hoàn thành</em>",
      "feed.3": "Knowledge Agent đã trích dẫn 52 tài liệu chính sách <em>✓ Hoàn thành</em>",
      "feed.4": "Data Agent đang truy vấn bảng doanh thu <em>● Đang chạy</em>",
      "feed.5": "Truy vấn doanh thu của Data Agent lỗi một lần (bộ lọc cũ) → đã thử lại với bộ lọc đúng <em>↻ Đã thử lại</em>",
      "feed.6": "Synthesis đang hợp nhất các phát hiện đã xác minh <em>● Đang chạy</em>",
      "feed.show_all": "Xem tất cả ({n} sự kiện)",
      "feed.show_less": "Thu gọn",
      "preview.graph_title": "Đồ thị thực thi · 3 agent tiêu biểu trong workspace 12 agent",
      "preview.run_aria": "Tóm tắt lượt chạy: trạng thái, phụ trách, bước tiếp theo",
      "run.status_label": "Trạng thái",
      "run.status_val": "● Đang chạy · hoàn thành 72%",
      "run.owner_label": "Phụ trách",
      "run.owner_val": "Tài chính",
      "run.next_label": "Bước tiếp theo",
      "run.next_val": "Data Agent hoàn tất truy vấn → Synthesis chờ duyệt",
      "graph.hide": "Ẩn đồ thị thực thi đầy đủ",
      "graph.show": "Hiện đồ thị thực thi đầy đủ (6 bước, 3 agent tiêu biểu)",
      "preview.scroll_aria": "Sơ đồ thực thi, cuộn ngang trên màn hình nhỏ",
      "preview.graph_aria": "Đồ thị thực thi của agent: Planner, rồi các agent Research, Data và Knowledge chạy song song, rồi Synthesis, rồi Kết quả",
      "preview.fan_aria": "Các agent song song: Research, Data, Knowledge",
      "node.planner_detail": "6 bước · kế hoạch đã duyệt",
      "node.research_detail": "Web Search · 74 nguồn",
      "node.data_detail": "Kho SQL · doanh thu",
      "node.knowledge_detail": "Cơ sở chính sách · 52 tài liệu",
      "node.synthesis_detail": "Đang hợp nhất phát hiện đã xác minh",
      "node.validation": "Kiểm định",
      "node.validation_detail": "Đối chiếu số liệu · đang chờ",
      "node.result": "Kết quả",
      "node.result_detail": "Báo cáo điều hành · bản nháp",
      "state.completed": "✓ Hoàn thành",
      "state.running": "● Đang chạy",
      "state.pending": "○ Chờ xử lý",
      "preview.metrics_aria": "Tổng số của bản chạy mẫu",
      "metrics.agents": "Agent trong workspace",
      "metrics.tools": "Lượt gọi công cụ",
      "metrics.sources": "Nguồn",
      "metrics.complete": "Hoàn thành",
      "preview.metrics_note": "Tổng số của bản chạy mẫu — đồ thị hiển thị 3 agent chuyên trách tiêu biểu trong workspace 12 agent.",
      "preview.progress_aria": "Tiến độ workspace",
      "orch.eyebrow": "02 · Điều phối",
      "orch.title": "Một mục tiêu, nhiều agent, một kết quả đã xác minh",
      "orch.lead": "Bộ điều phối chia nhỏ mục tiêu, chạy các agent chuyên trách song song, rồi chỉ hợp nhất những phát hiện đã xác minh.",
      "orch.hint": "Sơ đồ có thể cuộn — vuốt hoặc nhấn Tab tới luồng, rồi dùng phím mũi tên để khám phá &rarr;",
      "orch.scroll_aria": "Sơ đồ luồng điều phối, cuộn ngang",
      "orch.flow_aria": "Luồng điều phối cho Phân tích doanh thu Q2: mục tiêu, kế hoạch, agent chuyên trách song song, hợp nhất đã xác minh, kết quả",
      "orch.goal_kicker": "Mục tiêu kinh doanh",
      "orch.goal_title": "Phân tích doanh thu Q2",
      "orch.goal_sub": "Phụ trách: Tài chính · hạn thứ Sáu",
      "orch.plan_kicker": "Bộ điều phối",
      "orch.plan_title": "Kế hoạch: 6 bước",
      "orch.plan_sub": "Định tuyến · thử lại · phê duyệt",
      "orch.agents_aria": "Ba agent chuyên trách song song",
      "orch.agents_kicker": "Agent chuyên trách · song song",
      "orch.tip_research": "Agent Research — Web Search trên 74 nguồn, đã hoàn thành",
      "orch.tip_data": "Agent Data — bảng doanh thu trong kho SQL, đang chạy",
      "orch.tip_knowledge": "Agent Knowledge — cơ sở chính sách trên 52 tài liệu, đã hoàn thành",
      "orch.tool_research": "Web Search · 74 nguồn",
      "orch.tool_data": "Kho SQL · bảng doanh thu",
      "orch.tool_knowledge": "Cơ sở chính sách · 52 tài liệu",
      "orch.synth_kicker": "Hợp nhất + kiểm định",
      "orch.synth_title": "Hợp nhất đã xác minh",
      "orch.synth_sub": "Số liệu đối chiếu chéo · xung đột được gắn cờ, không che giấu",
      "orch.result_kicker": "Kết quả cuối cùng",
      "orch.result_title": "Báo cáo sẵn sàng trình bày",
      "orch.result_sub": "Mọi luận điểm đều trích dẫn nguồn",
      "orch.legend_aria": "Chú thích màu viền: Mục tiêu đen, Kế hoạch xanh dương, Song song xanh nhạt, Hợp nhất đã xác minh tím, Kết quả xanh lá",
      "legend.goal": "Mục tiêu",
      "legend.plan": "Kế hoạch",
      "legend.parallel": "Song song",
      "legend.merge": "Hợp nhất đã xác minh",
      "legend.result": "Kết quả",
      "stack.title": "Tương thích với hạ tầng của bạn",
      "stack.line": "PostgreSQL · Slack · Salesforce · GitHub · S3 — kết nối qua connector và API chuẩn. Mọi lệnh gọi đều được ghi log.",
      "how.eyebrow": "03 · Quy trình",
      "how.title": "Cách AgentOS vận hành",
      "how.lead": "Năm giai đoạn từ yêu cầu tới kết quả bàn giao — một luồng liên tục.",
      "how.flow_aria": "Luồng quy trình AgentOS",
      "how.k1": "01 · Tiếp nhận ✓ Hoàn thành",
      "how.t1": "Tiếp nhận",
      "how.p1": "AgentOS làm rõ yêu cầu, tiêu chí thành công và phê duyệt cần có cho từng bước.",
      "how.k2": "02 · Kế hoạch ✓ Hoàn thành",
      "how.t2": "Kế hoạch",
      "how.p2": "Planner chia mục tiêu thành các bước và giao mỗi bước cho đúng agent chuyên trách.",
      "how.k3": "03 · Thực thi ● Đang chạy",
      "how.t3": "Thực thi — các agent song song",
      "how.p3": "Các agent làm việc trên tri thức đã phê duyệt và công cụ kinh doanh, tiến độ luôn hiển thị.",
      "how.branch_aria": "Nhánh thực thi: agent Research và Data đang chạy song song",
      "how.tip_research": "Nhánh Research — Web Search, đã hoàn thành",
      "how.tip_data": "Nhánh Data — kho SQL, đang chạy",
      "how.branch_research": "Web Search · ✓ Hoàn thành",
      "how.branch_data": "Kho SQL · ● Đang chạy",
      "how.k4": "04 · Kiểm định ○ Chờ xử lý",
      "how.t4": "Kiểm định",
      "how.p4": "Số liệu được đối chiếu với nguồn. Xung đột được gắn cờ, không che giấu.",
      "how.retry": "<strong>Lần thử lại minh hoạ:</strong> truy vấn doanh thu của Data Agent lỗi một lần (bộ lọc cũ) → đã thử lại với bộ lọc đúng → ghi log là <em>● Đã thử lại</em>.",
      "how.k5": "05 · Bàn giao ○ Chờ xử lý",
      "how.t5": "Bàn giao",
      "how.p5": "Các phát hiện đã xác minh được hợp nhất thành kết quả hoàn chỉnh, truy vết được tới từng nguồn và hành động.",
      "how.recap": "Từ yêu cầu → kết quả đã xác minh trong 5 giai đoạn có thể kiểm toán.",
      "cap.eyebrow": "04 · Năng lực",
      "cap.title": "Được xây dựng cho công việc đòi hỏi độ tin cậy",
      "cap.lead": "Điều phối, hiển thị, tri thức và công cụ trong một workspace được kiểm soát.",
      "cap.lead_h": "Có kết quả đã xác minh nhanh hơn — điều phối đa agent",
      "cap.lead_p": "Chia mục tiêu kinh doanh thành kế hoạch có giám sát. Các agent chuyên trách chạy song song, bộ điều phối xử lý thứ tự, thử lại và bàn giao — để mười hai agent vận hành như một đội.",
      "cap.lead_li1": "Các agent chuyên trách song song với trách nhiệm rõ ràng",
      "cap.lead_li2": "Bàn giao theo thứ tự: lập kế hoạch → thực thi → kiểm định → hợp nhất",
      "cap.lead_li3": "Cổng phê duyệt của con người ở bước quan trọng",
      "cap.vis_h": "Tin tưởng từng bước — hiển thị thực thi",
      "cap.vis_p": "Theo dõi mọi lượt chạy theo từng node. Trạng thái luôn diễn đạt bằng chữ — ● Đang chạy, ✓ Hoàn thành, ○ Chờ xử lý — không bao giờ chỉ dùng màu sắc.",
      "cap.know_h": "Câu trả lời có bằng chứng — tri thức doanh nghiệp",
      "cap.know_p": "Gắn agent với tài liệu và chính sách đã phê duyệt. Mỗi câu trả lời đều kèm nguồn đã sử dụng.",
      "cap.tools_h": "Làm việc nơi công việc diễn ra — công cụ kinh doanh",
      "cap.tools_p": "Kết nối kho dữ liệu, CRM và API nội bộ. Mọi lệnh gọi công cụ đều ghi log kèm đầu vào và kết quả.",
      "tabs.title": "Xem trên một yêu cầu thực tế",
      "tabs.aria": "Các tình huống sử dụng",
      "tabs.market": "Intel thị trường Q2",
      "tabs.revenue": "Rà soát doanh thu",
      "tabs.triage": "Phân loại ticket",
      "tabs.ops": "Trực vận hành",
      "panel.market_copy": "Quét hồ sơ công bố, trích dẫn tài liệu chính sách và soạn mục báo cáo điều hành kèm nguồn.",
      "panel.revenue_copy": "Truy vấn bảng trong kho dữ liệu, xác minh số liệu và gắn cờ chênh lệch để Tài chính phê duyệt.",
      "panel.triage_copy": "Phân loại ticket mới, đặt mức ưu tiên và chuyển cho đúng người xử lý kèm ngữ cảnh.",
      "panel.ops_copy": "Gọi đúng người trực, đính kèm runbook và giữ dòng thời gian mà cả đội đều theo dõi được.",
      "panel.m_market_sources": "Nguồn đã quét <span class=\"SampleTag\">mẫu</span>",
      "panel.m_market_docs": "Tài liệu trích dẫn <span class=\"SampleTag\">mẫu</span>",
      "panel.m_market_steps": "Bước kế hoạch <span class=\"SampleTag\">mẫu</span>",
      "panel.m_rev_tables": "Bảng đã truy vấn <span class=\"SampleTag\">mẫu</span>",
      "panel.m_rev_figures": "Số liệu đã xác minh <span class=\"SampleTag\">mẫu</span>",
      "panel.m_rev_var": "Chênh lệch đã gắn cờ <span class=\"SampleTag\">mẫu</span>",
      "panel.m_tri_tickets": "Ticket đã phân loại <span class=\"SampleTag\">mẫu</span>",
      "panel.m_tri_queues": "Hàng đợi đã chuyển <span class=\"SampleTag\">mẫu</span>",
      "panel.m_tri_owners": "Người xử lý đã gán <span class=\"SampleTag\">mẫu</span>",
      "panel.m_ops_inc": "Sự cố đã gọi <span class=\"SampleTag\">mẫu</span>",
      "panel.m_ops_books": "Runbook đính kèm <span class=\"SampleTag\">mẫu</span>",
      "panel.m_ops_ack": "Ack trung vị <span class=\"SampleTag\">mẫu</span>",
      "panel.next_audit": "Xem cách lượt chạy luôn kiểm toán được <span aria-hidden=\"true\">→</span>",
      "panel.next_controls": "Xem cơ chế phê duyệt <span aria-hidden=\"true\">→</span>",
      "trust.eyebrow": "05 · Kiểm soát",
      "trust.title": "Kiểm soát là một phần của sản phẩm",
      "trust.lead": "Quyền tự chủ có thể kiểm toán — cam kết hiện tại của chúng tôi.",
      "trust.vis_h": "Hiển thị",
      "trust.vis_p": "Quan sát kế hoạch, trạng thái agent, lệnh gọi công cụ và tiến độ ngay khi diễn ra. Không có gì thực thi ngoài tầm nhìn.",
      "trust.timeline_aria": "Dòng thời gian của bản chạy mẫu",
      "trust.tl1": "Kế hoạch đã duyệt <em>✓ Hoàn thành</em>",
      "trust.tl2": "Data Agent · truy vấn SQL <em>● Đang chạy</em>",
      "trust.tl3": "Synthesis đang chờ <em>○ Chờ xử lý</em>",
      "trust.ctl_h": "Kiểm soát",
      "trust.ctl_p": "Yêu cầu phê duyệt trước bước nhạy cảm, tạm dừng hoặc huỷ lượt chạy bất cứ lúc nào, và giới hạn công cụ mỗi agent được chạm tới.",
      "trust.gate_aria": "Minh hoạ cổng phê duyệt",
      "trust.gate_title": "Cổng phê duyệt · xuất bản báo cáo",
      "trust.pause": "Tạm dừng",
      "trust.resume": "Tiếp tục",
      "trust.cancel": "Huỷ",
      "trust.gate_waiting": "Đang chờ chủ sở hữu Tài chính.",
      "trust.gate_paused": "Đã tạm dừng bởi chủ sở hữu Tài chính. Tiếp tục bất cứ lúc nào.",
      "trust.gate_cancelled": "Đã yêu cầu huỷ. Lượt chạy sẽ dừng sau lệnh gọi công cụ hiện tại.",
      "trust.tr_h": "Truy vết",
      "trust.tr_p": "Mọi kết quả đều liên kết ngược tới nguồn, lệnh gọi công cụ và quyết định đã tạo ra nó — có thể phát lại trong nhật ký hoạt động.",
      "trust.map_aria": "Minh hoạ ánh xạ nguồn",
      "trust.map1t": "Báo cáo §2 · doanh thu +8%",
      "trust.map1d": "Kho SQL · q2_revenue.sql ✓ Đã xác minh",
      "trust.map2t": "Báo cáo §3 · thị phần",
      "trust.map2d": "Web Search · 74 hồ sơ ✓ Đã xác minh",
      "cta.eyebrow": "06 · Kết quả",
      "cta.title": "Mang mục tiêu kinh doanh tiếp theo của bạn.<br />Nhận lại một kết quả đã thực thi.",
      "cta.lead": "Bắt đầu bằng một yêu cầu thực — Intel thị trường Q2, Phân tích doanh thu, rà soát chính sách — và xem AgentOS lập kế hoạch, điều phối và bàn giao.",
      "cta.demo_aria": "Xem trước bản chạy mẫu",
      "cta.goal": "“Phân tích hiệu quả thị trường Q2 và chuẩn bị báo cáo điều hành.”",
      "cta.step1": "Nghiên cứu <span>✓ Hoàn thành</span>",
      "cta.step2": "Phân tích <span>✓ Hoàn thành</span>",
      "cta.step3": "Tri thức <span>✓ Hoàn thành</span>",
      "cta.step4": "Báo cáo <span>● Đang chạy</span>",
      "cta.replay": "Phát lại lượt chạy",
      "cta.path_free": "workspace miễn phí",
      "cta.path_existing": "workspace hiện có",
      "cta.micro": "Không cần thẻ tín dụng · huỷ lượt chạy bất cứ lúc nào",
      "deploy.title": "Triển khai theo cách của bạn",
      "deploy.self_h": "Tự lưu trữ",
      "deploy.self_p": "Chạy trong trung tâm dữ liệu của bạn.",
      "deploy.vpc_p": "Chạy cách ly trong tài khoản cloud của bạn.",
      "deploy.cloud_h": "Cloud",
      "deploy.cloud_p": "Workspace được quản lý để bắt đầu nhanh.",
      "deploy.audit_label": "Nhật ký kiểm toán · ",
      "deploy.copy": "Sao chép",
      "deploy.copied": "Đã sao chép",
      "deploy.copy_failed": "Sao chép thất bại — hãy chọn dòng thủ công",
      "footer.tag": "AgentOS. Tự động hoá AI cho doanh nghiệp.",
      "footer.aria": "Chân trang",
      "footer.sample": "Bản chạy mẫu",
      "footer.openapp": "Mở ứng dụng"
    }
  };
  var lang = "en";
  try {
    var savedLang = localStorage.getItem("agentos.lang");
    if (savedLang === "vi" || savedLang === "en") lang = savedLang;
  } catch (err) { /* default en */ }
  // ponytail: one lookup with {var} interpolation, en fallback, key last resort
  function t(key, vars) {
    var s = (I18N[lang] && I18N[lang][key] != null) ? I18N[lang][key] : I18N.en[key];
    if (s == null) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    }
    return s;
  }
  function refreshGate() {
    var note = document.getElementById("gateNote");
    if (!note) return;
    var pauseBtn = document.querySelector('.TrustGate-btn[data-gate="pause"]');
    var cancelBtn = document.querySelector('.TrustGate-btn[data-gate="cancel"]');
    var paused = pauseBtn && pauseBtn.getAttribute("aria-pressed") === "true";
    var cancelled = cancelBtn && cancelBtn.disabled;
    if (cancelled) note.textContent = t("trust.gate_cancelled");
    else if (paused) note.textContent = t("trust.gate_paused");
    else note.textContent = t("trust.gate_waiting");
    if (pauseBtn) pauseBtn.textContent = paused ? t("trust.resume") : t("trust.pause");
    if (cancelBtn) cancelBtn.textContent = t("trust.cancel");
  }
  function refreshDynamicStrings() {
    var st = document.getElementById("previewStatus");
    if (st) st.innerHTML = '<span class="StatusDot StatusDot--running" aria-hidden="true"></span>' + t("preview.status_running");
    var feed = document.getElementById("activityFeed");
    var ft = document.getElementById("feedToggle");
    if (feed && ft) {
      var n = feed.querySelectorAll("li").length;
      var expanded = ft.getAttribute("aria-expanded") === "true";
      ft.textContent = expanded ? t("feed.show_less") : t("feed.show_all", { n: n });
    }
    var gt = document.getElementById("graphToggle");
    var ps = document.getElementById("previewScroll");
    if (gt && ps) {
      var collapsed = ps.classList.contains("is-collapsed");
      var small = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
      gt.textContent = (!small || !collapsed) ? t("graph.hide") : t("graph.show");
    }
    var navToggle = document.getElementById("homeNavToggle");
    if (navToggle) {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-label", open ? t("nav.menu_close") : t("nav.menu_open"));
    }
    refreshGate();
  }
  function applyLang(next) {
    if (next === "vi" || next === "en") lang = next;
    try { localStorage.setItem("agentos.lang", lang); } catch (err) { /* never break page */ }
    document.documentElement.lang = lang;
    document.title = t("meta.title");
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("meta.description"));
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria-label")));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang-btn") === lang ? "true" : "false");
    });
    refreshDynamicStrings();
  }
  function setupLang() {
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang-btn")); });
    });
  }

  // Shared: tenant theme (?org=) + analytics stub (local queue, cap 50).
  try {
    var orgParam = new URLSearchParams(window.location.search).get("org");
    if (orgParam) {
      orgParam = orgParam.replace(/[^a-z0-9 .\-]/gi, "").slice(0, 24);
      var brandSpan = document.querySelector(".HomeNav-brand span:last-child");
      if (orgParam && brandSpan) brandSpan.textContent = "AgentOS · " + orgParam;
    }
  } catch (err) { /* decorative only */ }
  function track(event, data) {
    try {
      var q = JSON.parse(localStorage.getItem("agentos.events") || "[]");
      q.push({ page: "home", event: event, data: data || null, ts: Date.now() });
      localStorage.setItem("agentos.events", JSON.stringify(q.slice(-50)));
      if (window.console && console.debug) console.debug("[analytics]", event, data || "");
    } catch (err) { /* never break page */ }
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href*="register"], a[href*="login"], a[href*="dashboard"]') : null;
    if (a) track("cta", a.getAttribute("href"));
    var tab = e.target.closest ? e.target.closest('[role="tab"]') : null;
    if (tab) track("tab", tab.id);
    if (e.target.closest && e.target.closest("#ctaReplay")) track("replay");
  });

  // 1. Mobile nav: single dropdown panel on .HomeNav-nav. Escape closes, focus returns.
  var toggle = document.getElementById("homeNavToggle");
  var links = document.getElementById("homeNavLinks");
  var actions = document.getElementById("homeNavActions");
  var nav = toggle ? toggle.closest(".HomeNav-nav") : null;
  function setNav(open) {
    if (nav) nav.classList.toggle("is-open", open);
    // Keep legacy .open classes in sync for CSS compat.
    if (links) links.classList.toggle("open", open);
    if (actions) actions.classList.toggle("open", open);
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? t("nav.menu_close") : t("nav.menu_open"));
    }
    if (!open && toggle && document.activeElement && nav && nav.contains(document.activeElement)) {
      toggle.focus();
    }
  }
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = nav ? !nav.classList.contains("is-open") : !links.classList.contains("open");
      setNav(open);
      if (open) {
        var first = links.querySelector("a");
        if (first) first.focus();
      }
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && nav && nav.classList.contains("is-open")) {
        ev.preventDefault();
        setNav(false);
        toggle.focus();
      }
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setNav(false); });
    });
    if (actions) actions.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setNav(false); });
    });
    // Reset panel when resizing back to desktop so it never traps state.
    if (window.matchMedia) {
      var mq = window.matchMedia("(min-width: 769px)");
      var onMq = function (e) { if (e.matches) setNav(false); };
      if (mq.addEventListener) mq.addEventListener("change", onMq);
    }
  }

  // 1b. Execution graph expand-on-demand for small screens (default open on desktop).
  var graphToggle = document.getElementById("graphToggle");
  var previewScroll = document.getElementById("previewScroll");
  function syncGraphToggle() {
    if (!graphToggle || !previewScroll) return;
    var small = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
    if (!small) {
      previewScroll.classList.remove("is-collapsed");
      graphToggle.setAttribute("aria-expanded", "true");
      graphToggle.textContent = t("graph.hide");
      return;
    }
    // On small screens start collapsed once (honor prior user choice).
    if (!graphToggle.hasAttribute("data-touched")) {
      previewScroll.classList.add("is-collapsed");
      graphToggle.setAttribute("aria-expanded", "false");
      graphToggle.textContent = t("graph.show");
    }
  }
  if (graphToggle && previewScroll) {
    graphToggle.addEventListener("click", function () {
      var collapsed = previewScroll.classList.toggle("is-collapsed");
      graphToggle.setAttribute("data-touched", "true");
      graphToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      graphToggle.textContent = collapsed
        ? t("graph.show")
        : t("graph.hide");
    });
    syncGraphToggle();
    window.addEventListener("resize", syncGraphToggle);
  }

  // 2. Footer year.
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // 3. Execution preview: progress fill + state-driven node activation.
  var bar = document.getElementById("previewProgress");
  var wrap = document.getElementById("previewProgressWrap");
  var graph = document.getElementById("agentGraph");
  var status = document.getElementById("previewStatus");

  function paint() {
    if (bar) {
      bar.style.width = mockWorkspace.progress + "%";
      if (wrap) wrap.setAttribute("aria-valuenow", String(mockWorkspace.progress));
    }
    var mp = document.getElementById("metricProgress");
    if (mp) mp.textContent = mockWorkspace.progress + "%";
    var ma = document.getElementById("metricAgents");
    if (ma) ma.textContent = String(mockWorkspace.agents);
    var mt = document.getElementById("metricTools");
    if (mt) mt.textContent = String(mockWorkspace.toolCalls);
    var ms = document.getElementById("metricSources");
    if (ms) ms.textContent = String(mockWorkspace.sources);
    if (status) status.innerHTML = '<span class="StatusDot StatusDot--running" aria-hidden="true"></span>' + t("preview.status_running");
  }

  // ponytail: single one-shot observer helper, no polyfill timers unless needed
  function onceIn(el, fn, threshold) {
    if (reduceMotion || !canObserve || !el) { fn(true); return null; }    var done = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !done) { done = true; io.disconnect(); fn(false); }
      });
    }, { threshold: threshold || 0.25 });
    io.observe(el);
    return io;
  }

  // 3b. Preview metrics row (single truth row): count from 0 on entry only, 200ms.
  function animatePreviewMetrics() {
    if (reduceMotion || !window.requestAnimationFrame) return;
    var jobs = [
      { el: document.getElementById("metricAgents"), target: mockWorkspace.agents, suffix: "" },
      { el: document.getElementById("metricTools"), target: mockWorkspace.toolCalls, suffix: "" },
      { el: document.getElementById("metricSources"), target: mockWorkspace.sources, suffix: "" },
      { el: document.getElementById("metricProgress"), target: mockWorkspace.progress, suffix: "%" }
    ].filter(function (j) { return j.el; });
    if (!jobs.length) return;
    var dur = 200;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      jobs.forEach(function (j) {
        j.el.textContent = Math.round(j.target * p) + j.suffix;
      });
      if (p < 1) window.requestAnimationFrame(frame);
      else paint();
    }
    window.requestAnimationFrame(frame);
  }

  var graphActivated = false;

  function activateNodes() {
    if (!graph) return;
    var preview = graph.closest ? graph.closest(".ExecutionPreview") : null;
    if (preview) preview.classList.add("is-in");
    // Idempotent: never strip live states (avoids a pale flash on revisit).
    if (graphActivated || graph.classList.contains("is-connectors-in")) { paint(); return; }
    graphActivated = true;
    // State-driven: only nodes carrying data-state participate, in DOM order.
    var nodes = graph.querySelectorAll(".AgentNode[data-state]");
    graph.classList.add("is-connectors-in");
    if (!nodes.length || reduceMotion) {
      paint();
      return;
    }
    // Start from a quiet state, then activate in graph order (60ms stagger, ≤120ms).
    nodes.forEach(function (n) { n.classList.remove("is-done", "is-active", "is-pending"); });
    if (bar) { bar.style.width = "0%"; if (wrap) wrap.setAttribute("aria-valuenow", "0"); }
    animatePreviewMetrics();
    nodes.forEach(function (node, step) {
      window.setTimeout(function () {
        var state = node.getAttribute("data-state");
        node.classList.add(state === "running" ? "is-active" : state === "done" ? "is-done" : "is-pending");
        if (bar) {
          var pct = Math.round(mockWorkspace.progress * ((step + 1) / nodes.length));
          bar.style.width = pct + "%";
          if (wrap) wrap.setAttribute("aria-valuenow", String(pct));
        }
        if (step === nodes.length - 1) paint();
      }, 60 * (step + 1));
    });
  }

  if (reduceMotion) {
    paint();
    if (graph) graph.classList.add("is-connectors-in");
  } else if (graph && canObserve) {
    var seen = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !seen) {
          seen = true;
          activateNodes();
          io.disconnect();
        }
      });
    }, { threshold: 0.25 });
    io.observe(graph);
    // Fallback: paint if observer never fires. Deferred to the slide
    // controller when section 02 is not the active slide.
    window.setTimeout(function () {
      if (seen) return;
      var activeSec = document.querySelector("main > section.FsSection.is-active");
      if (activeSec && activeSec.getAttribute("data-section") !== "1") return;
      seen = true; activateNodes();
    }, 4000);
  } else {
    paint();
    if (graph) graph.classList.add("is-connectors-in");
  }

  // 4. Hero ticker removed — the preview metrics row is the single truth row (no duplication).

  // 5a. Shared reveal-on-scroll utility (≤200ms ease-out, staggered ≤120ms).
  function setupReveal() {
    var targets = document.querySelectorAll(
      ".SectionTitle, .SectionLead, .StackStrip, .CapTabs, .CtaDemo, .DeployStrip, .PreviewSection .ExecutionPreview, .FinalCta h2, .FinalCta > .HomeContainer > p"
    );
    if (reduceMotion || !canObserve || !targets.length) return;
    targets.forEach(function (el, i) {
      el.classList.add("Reveal");
      el.style.setProperty("--reveal-delay", String(Math.min((i % 4) * 40, 120)) + "ms");
    });
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); rio.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    targets.forEach(function (el) { rio.observe(el); });
  }

  // 5b. Activity feed: 3 latest visible + inline "Show all" toggle. No-JS shows all rows.
  function setupFeed() {
    var feed = document.getElementById("activityFeed");
    if (!feed) return;
    var rows = feed.querySelectorAll("li");
    if (!rows.length) return;
    var toggle = document.getElementById("feedToggle");
    function showLatest() {
      // Markup is oldest-first: keep the 3 latest (last 3) visible.
      rows.forEach(function (li, i) { li.hidden = i < rows.length - 3; });
    }
    function showAll() {
      rows.forEach(function (li) { li.hidden = false; });
    }
    if (toggle) {
      showLatest();
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = t("feed.show_all", { n: rows.length });
      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        if (expanded) {
          showLatest();
          toggle.setAttribute("aria-expanded", "false");
          toggle.textContent = t("feed.show_all", { n: rows.length });
        } else {
          showAll();
          toggle.setAttribute("aria-expanded", "true");
          toggle.textContent = t("feed.show_less");
        }
      });
    }
    if (reduceMotion || !canObserve) return; // final state = plain markup, no hidden class
    rows.forEach(function (li) { li.classList.add("is-feed-hidden"); });
    onceIn(feed, function () {
      rows.forEach(function (li, i) {
        window.setTimeout(function () {
          li.classList.remove("is-feed-hidden");
          li.classList.add("is-feed-in");
        }, Math.min(i * 30, 120));
      });
    }, 0.3);
  }

  // 5c. Orchestration nodes: stepped IntersectionObserver reveals (no scroll-scrub).
  function setupOrchestration() {
    var flow = document.querySelector(".OrchFlow");
    var steps = document.querySelector(".FlowSteps");
    if (reduceMotion) {
      if (flow) flow.classList.add("is-connectors-in");
      if (steps) steps.classList.add("is-connectors-in");
      return;
    }
    if (!canObserve) {
      if (flow) flow.classList.add("is-connectors-in");
      if (steps) steps.classList.add("is-connectors-in");
      return;
    }
    if (flow) {
      var items = flow.querySelectorAll(":scope > li");
      items.forEach(function (li) { li.classList.add("is-flow-hidden"); });
      var branch = flow.querySelector(".OrchNode--agents ul");
      if (branch) branch.classList.add("is-branch-hidden");
      var flowSeen = false;
      var fio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !flowSeen) {
            flowSeen = true;
            items.forEach(function (li, i) {
              window.setTimeout(function () {
                li.classList.remove("is-flow-hidden");
                li.classList.add("is-flow-in");
              }, Math.min(i * 30, 120));
            });
            window.setTimeout(function () {
              flow.classList.add("is-connectors-in");
              if (branch) {
                branch.classList.remove("is-branch-hidden");
                branch.classList.add("is-branch-in");
              }
            }, 120);
            fio.disconnect();
          }
        });
      }, { threshold: 0.25 });
      fio.observe(flow);
    }
    if (steps) {
      var fb = steps.querySelector(".FlowBranch");
      if (fb) fb.classList.add("is-branch-hidden");
      onceIn(steps, function () {
        steps.classList.add("is-connectors-in");
        if (fb) {
          window.setTimeout(function () {
            fb.classList.remove("is-branch-hidden");
            fb.classList.add("is-branch-in");
          }, 120);
        }
      }, 0.25);
    }
  }

  // 5d. Capabilities + trust cards slide in staggered.
  function setupCards() {
    var cards = document.querySelectorAll(".Capability, .Trust-grid article");
    if (!cards.length) return;
    if (reduceMotion || !canObserve) return;
    cards.forEach(function (el, i) {
      el.classList.add("is-card-hidden");
      var group = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : i;
      el.style.setProperty("--reveal-delay", String(Math.min(group * 30, 120)) + "ms");
    });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.remove("is-card-hidden");
          e.target.classList.add("is-card-in");
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    cards.forEach(function (el) { cio.observe(el); });
  }

  // 5e. Trust timeline draws vertically + rows stagger.
  function setupTimeline() {
    var tl = document.querySelector(".TrustTimeline");
    if (!tl) return;
    var rows = tl.querySelectorAll("li");
    if (reduceMotion || !canObserve) return;
    rows.forEach(function (li) { li.classList.add("is-tl-hidden"); });
    onceIn(tl, function () {
      tl.classList.add("is-timeline-in");
      rows.forEach(function (li, i) {
        window.setTimeout(function () {
          li.classList.remove("is-tl-hidden");
          li.classList.add("is-tl-in");
        }, Math.min(i * 30, 120));
      });
    }, 0.3);
  }

  // 5f. CTA demo checklist ticks progressively.
  function setupChecklist() {
    var list = document.querySelector(".CtaDemo-steps");
    if (!list) return;
    var items = list.querySelectorAll("li");
    if (reduceMotion || !canObserve) return;
    // Capture final states, start quiet, then replay in order.
    var finals = Array.prototype.map.call(items, function (li) {
      return li.classList.contains("is-done") ? "is-done" : li.classList.contains("is-active") ? "is-active" : "";
    });
    items.forEach(function (li) {
      li.classList.remove("is-done", "is-active");
      li.classList.add("is-check-hidden");
    });
    onceIn(list, function () { play(); }, 0.4);
    function play() {
      items.forEach(function (li, i) {
        li.classList.remove("is-check-in", "is-done", "is-active");
        li.classList.add("is-check-hidden");
      });
      items.forEach(function (li, i) {
        window.setTimeout(function () {
          li.classList.remove("is-check-hidden");
          li.classList.add("is-check-in");
          if (finals[i]) li.classList.add(finals[i]);
        }, Math.min(i * 30, 120));
      });
    }
    var replay = document.getElementById("ctaReplay");
    if (replay) replay.addEventListener("click", play);
  }

  // 5g. Use-case tabs: roving tabindex + arrow keys, cross-fade content.
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(next, animate) {
    tabs.forEach(function (t) {
      var selected = t === next;
      t.setAttribute("aria-selected", selected ? "true" : "false");
      t.classList.toggle("is-selected", selected);
      if (selected) t.removeAttribute("tabindex");
      else t.setAttribute("tabindex", "-1");
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) {
        if (selected) {
          panel.removeAttribute("hidden");
          if (animate && !reduceMotion) {
            panel.classList.add("is-tab-fade");
            panel.classList.remove("is-tab-in");
            window.requestAnimationFrame(function () {
              window.requestAnimationFrame(function () {
                panel.classList.remove("is-tab-fade");
                panel.classList.add("is-tab-in");
              });
            });
          }
        } else {
          panel.setAttribute("hidden", "");
          panel.classList.remove("is-tab-in", "is-tab-fade");
        }
      }
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab, true); });
    tab.addEventListener("keydown", function (ev) {
      var next = null;
      if (ev.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (ev.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (ev.key === "Home") next = tabs[0];
      else if (ev.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        ev.preventDefault();
        selectTab(next, true);
        next.focus();
      }
    });
  });

  // 5h. Trust approval gate: state reflected immediately in aria-live note + buttons.
  var gateNote = document.getElementById("gateNote");
  var gateBtns = document.querySelectorAll(".TrustGate-btn");
  gateBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!gateNote) return;
      var action = btn.getAttribute("data-gate");
      if (action === "pause") {
        var paused = btn.getAttribute("aria-pressed") === "true";
        btn.setAttribute("aria-pressed", paused ? "false" : "true");
        btn.textContent = paused ? t("trust.pause") : t("trust.resume");
        gateNote.textContent = paused
          ? t("trust.gate_waiting")
          : t("trust.gate_paused");
      } else {
        gateNote.textContent = t("trust.gate_cancelled");
        gateBtns.forEach(function (b) {
          if (b.getAttribute("data-gate") === "cancel") b.disabled = true;
          b.setAttribute("aria-pressed", "false");
        });
        var pauseBtn = document.querySelector('.TrustGate-btn[data-gate="pause"]');
        if (pauseBtn) pauseBtn.textContent = t("trust.pause");
      }
    });
  });

  // 5i. Scrollspy: highlight nav item of section in view.
  function setupScrollspy() {
    var navLinks = document.querySelectorAll(".HomeNav-links a[href^='#']");
    if (!navLinks.length || reduceMotion || !canObserve) return;
    var map = {};
    navLinks.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      if (sec) map[id] = a;
    });
    var ids = Object.keys(map);
    if (!ids.length) return;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove("is-current"); a.removeAttribute("aria-current"); });
          var cur = map[e.target.id];
          if (cur) { cur.classList.add("is-current"); cur.setAttribute("aria-current", "true"); }
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    ids.forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  // Hero living background: 10-preset canvas engine (2D only, sky palette, light-enterprise calm).
  // Choice persists in localStorage key agentos.heroBg. Static single frame under
  // prefers-reduced-motion; auto-pauses when tab hidden or hero offscreen.
  var HERO_PRESETS = [
    { id: "node-field", name: "Node field", dot: "#0284C7" },
    { id: "synapse-fire", name: "Synapse fire", dot: "#0369A1" },
    { id: "dot-matrix", name: "Dot matrix", dot: "#0EA5E9" },
    { id: "ribbon-flow", name: "Ribbon flow", dot: "#7C3AED" },
    { id: "wave-lines", name: "Wave lines", dot: "#0284C7" },
    { id: "aurora-bands", name: "Aurora bands", dot: "#38BDF8" },
    { id: "particle-drift", name: "Particle drift", dot: "#64748B" },
    { id: "contour-topo", name: "Contour topo", dot: "#0369A1" },
    { id: "grid-pulse", name: "Grid pulse", dot: "#0EA5E9" },
    { id: "starfield-calm", name: "Starfield calm", dot: "#334155" }
  ];
  function setupHeroBg() {
    var canvas = document.getElementById("heroBg");
    if (!canvas || !canvas.getContext) return;
    var cur = "node-field";
    try {
      var saved = localStorage.getItem("agentos.heroBg");
      if (saved && HERO_PRESETS.some(function (p) { return p.id === saved; })) cur = saved;
    } catch (err) { /* never break page */ }
    var ctx = canvas.getContext("2d");
    var nodes = [];
    var stars = [];
    var signals = [];
    var raf = 0;
    var t = 0;
    var heroVisible = true;
    var inited = false;
    var COUNT = 26;
    var LINK = 170;
    function seed(w, h) {
      nodes = [];
      for (var i = 0; i < COUNT; i++) {
        var cx = ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * w + w / 2;
        nodes.push({ x: Math.min(Math.max(cx, 0), w), y: Math.random() * h,
          vx: 0.08 + Math.random() * 0.08, vy: (Math.random() - 0.5) * 0.04,
          r: 1.4 + Math.random() * 1.6, ph: Math.random() * Math.PI * 2 });
      }
      stars = [];
      for (var s = 0; s < 70; s++) {
        stars.push({ x: Math.random() * w, y: Math.random() * h,
          r: 0.8 + Math.random() * 1.4, ph: Math.random() * Math.PI * 2 });
      }
    }
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var w = canvas.clientWidth || (canvas.parentElement && canvas.parentElement.clientWidth) || window.innerWidth;
      var h = canvas.clientHeight || (canvas.parentElement && canvas.parentElement.clientHeight) || 600;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!nodes.length) seed(w, h);
    }
    function links(alpha) {
      var i, j, a, b, dx, dy, d;
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          a = nodes[i]; b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.strokeStyle = "rgba(2, 132, 199," + (alpha * (1 - d / LINK)).toFixed(3) + ")";
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
    }
    function dots(alpha) {
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        var glow = alpha + 0.08 * Math.sin(t * 0.03 + a.ph);
        ctx.fillStyle = "rgba(2, 132, 199," + Math.max(glow, 0.08).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    function drawSignals(max) {
      for (var i = signals.length - 1; i >= 0; i--) {
        var s = signals[i];
        s.t += 0.03;
        if (s.t >= 1) { signals.splice(i, 1); continue; }
        var sx = s.a.x + (s.b.x - s.a.x) * s.t;
        var sy = s.a.y + (s.b.y - s.a.y) * s.t;
        var fade = 1 - s.t;
        ctx.strokeStyle = "rgba(2, 100, 180," + (0.5 * fade).toFixed(3) + ")";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(s.a.x, s.a.y); ctx.lineTo(sx, sy); ctx.stroke();
        ctx.fillStyle = "rgba(2, 100, 180," + (0.9 * fade).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(sx, sy, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 1;
      }
      if (signals.length < max) {
        for (var k = 0; k < 8; k++) {
          var a = nodes[(Math.random() * nodes.length) | 0];
          var b = nodes[(Math.random() * nodes.length) | 0];
          if (!a || !b || a === b) continue;
          var dx = a.x - b.x, dy = a.y - b.y;
          if (Math.sqrt(dx * dx + dy * dy) < LINK) { signals.push({ a: a, b: b, t: 0 }); break; }
        }
      }
    }
    function draw(w, h) {
      ctx.clearRect(0, 0, w, h);
      var i, x, y;
      if (cur === "node-field") {
        links(0.22); dots(0.26);
      } else if (cur === "synapse-fire") {
        links(0.2); dots(0.24); drawSignals(5);
      } else if (cur === "dot-matrix") {
        var gap = 30;
        for (y = gap / 2; y < h; y += gap) {
          for (x = gap / 2; x < w; x += gap) {
            var p = 0.5 + 0.5 * Math.sin(t * 0.04 + x * 0.02 + y * 0.025);
            ctx.fillStyle = "rgba(2, 132, 199," + (0.08 + 0.16 * p).toFixed(3) + ")";
            ctx.beginPath(); ctx.arc(x, y, 1.3 + 1.1 * p, 0, Math.PI * 2); ctx.fill();
          }
        }
      } else if (cur === "ribbon-flow") {
        ctx.lineWidth = 1.5;
        for (i = 0; i < 5; i++) {
          var yy = h * (0.2 + 0.15 * i);
          ctx.strokeStyle = i % 2
            ? "rgba(124, 58, 237,0.16)"
            : "rgba(2, 132, 199,0.22)";
          ctx.beginPath();
          ctx.moveTo(-20, yy);
          for (x = 0; x <= w + 20; x += 40) {
            ctx.lineTo(x, yy + Math.sin(x * 0.012 + t * 0.02 + i * 1.4) * 22);
          }
          ctx.stroke();
        }
        ctx.lineWidth = 1;
      } else if (cur === "wave-lines") {
        ctx.lineWidth = 1;
        for (i = 0; i < 9; i++) {
          var wy = h * (0.1 + 0.1 * i);
          ctx.strokeStyle = "rgba(2, 132, 199," + (0.1 + 0.06 * (1 - i / 9)).toFixed(3) + ")";
          ctx.beginPath();
          for (x = 0; x <= w; x += 24) {
            var yo = wy + Math.sin(x * 0.02 + t * 0.025 + i * 0.7) * 12;
            if (x === 0) ctx.moveTo(x, yo); else ctx.lineTo(x, yo);
          }
          ctx.stroke();
        }
      } else if (cur === "aurora-bands") {
        var bands = [
          { c: "2, 132, 199", y: 0.3, wdt: 0.5, a: 0.1 },
          { c: "56, 189, 248", y: 0.45, wdt: 0.42, a: 0.09 },
          { c: "124, 58, 237", y: 0.6, wdt: 0.36, a: 0.07 }
        ];
        for (i = 0; i < bands.length; i++) {
          var bx = w / 2 + Math.sin(t * 0.008 + i * 2) * w * 0.06;
          var g = ctx.createRadialGradient(bx, h * bands[i].y, 10, bx, h * bands[i].y, w * bands[i].wdt);
          g.addColorStop(0, "rgba(" + bands[i].c + "," + bands[i].a + ")");
          g.addColorStop(1, "rgba(" + bands[i].c + ",0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
        }
        dots(0.18);
      } else if (cur === "particle-drift") {
        for (i = 0; i < nodes.length; i++) {
          var n = nodes[i];
          var tw = 0.5 + 0.5 * Math.sin(t * 0.02 + n.ph);
          ctx.fillStyle = "rgba(100, 116, 139," + (0.1 + 0.12 * tw).toFixed(3) + ")";
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 1.4, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(2, 132, 199," + (0.08 + 0.1 * tw).toFixed(3) + ")";
          ctx.beginPath(); ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2); ctx.fill();
        }
      } else if (cur === "contour-topo") {
        var centers = [
          { x: w * 0.3, y: h * 0.45 }, { x: w * 0.62, y: h * 0.55 }, { x: w * 0.8, y: h * 0.3 }
        ];
        ctx.lineWidth = 1;
        for (var c = 0; c < centers.length; c++) {
          for (var r = 18; r < Math.max(w, h) * 0.45; r += 26) {
            var wob = r + Math.sin(t * 0.015 + c + r * 0.05) * 3;
            ctx.strokeStyle = "rgba(3, 105, 161," + Math.max(0.22 - r / (Math.max(w, h)), 0.05).toFixed(3) + ")";
            ctx.beginPath(); ctx.arc(centers[c].x, centers[c].y, wob, 0, Math.PI * 2); ctx.stroke();
          }
        }
      } else if (cur === "grid-pulse") {
        var gs = 44;
        for (y = gs / 2; y < h; y += gs) {
          for (x = gs / 2; x < w; x += gs) {
            var dx = x - w / 2, dy = y - h * 0.35;
            var wave = 0.5 + 0.5 * Math.sin(Math.sqrt(dx * dx + dy * dy) * 0.03 - t * 0.05);
            ctx.fillStyle = "rgba(14, 165, 233," + (0.06 + 0.18 * wave).toFixed(3) + ")";
            ctx.beginPath(); ctx.arc(x, y, 1.2 + 1.6 * wave, 0, Math.PI * 2); ctx.fill();
          }
        }
      } else { // starfield-calm: static-ish twinkle, no travel
        for (i = 0; i < stars.length; i++) {
          var st = stars[i];
          var sa = 0.1 + 0.12 * (0.5 + 0.5 * Math.sin(t * 0.02 + st.ph));
          ctx.fillStyle = "rgba(51, 65, 85," + sa.toFixed(3) + ")";
          ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
        }
        links(0.08);
      }
    }
    function frame() {
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || 600;
      t++;
      if (cur !== "starfield-calm") {
        for (var i = 0; i < nodes.length; i++) {
          var n = nodes[i];
          n.x += n.vx * 0.6; n.y += n.vy * 0.6;
          if (n.x > w + 10) { n.x = -10; n.y = Math.random() * h; }
          if (n.y < -10) n.y = h + 10; else if (n.y > h + 10) n.y = -10;
        }
      }
      draw(w, h);
      raf = window.requestAnimationFrame(frame);
    }
    function stop() { if (raf) { window.cancelAnimationFrame(raf); raf = 0; } }
    function start() { if (!reduceMotion && !raf && !document.hidden && heroVisible && inited) raf = window.requestAnimationFrame(frame); }
    function paintOnce() {
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || 600;
      draw(w, h);
    }
    function setPreset(id, persist) {
      cur = id;
      signals = [];
      if (persist) {
        try { localStorage.setItem("agentos.heroBg", id); } catch (err) { /* never break page */ }
      }
      syncSwitcher();
      paintOnce();
    }
    // Switcher dropdown (pill button + listbox; arrows move, Enter selects, Escape closes).
    var btn = document.getElementById("heroBgBtn");
    var list = document.getElementById("heroBgList");
    var nameEl = document.getElementById("heroBgName");
    var dotEl = document.getElementById("heroBgDot");
    var focusIdx = -1;
    function syncSwitcher() {
      var p = HERO_PRESETS.filter(function (x) { return x.id === cur; })[0] || HERO_PRESETS[0];
      if (nameEl) nameEl.textContent = p.name;
      if (dotEl) dotEl.style.background = p.dot;
      if (list) {
        list.querySelectorAll("li").forEach(function (li) {
          li.setAttribute("aria-selected", li.getAttribute("data-preset") === cur ? "true" : "false");
        });
      }
    }
    function openList() {
      if (!list || !btn) return;
      list.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      focusIdx = Math.max(0, HERO_PRESETS.findIndex(function (p) { return p.id === cur; }));
      paintFocus();
    }
    function closeList(focusBtn) {
      if (!list || !btn) return;
      list.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      focusIdx = -1;
      list.querySelectorAll("li").forEach(function (li) { li.classList.remove("is-focus"); });
      if (focusBtn) btn.focus();
    }
    function isOpen() { return list && !list.hidden; }
    function paintFocus() {
      if (!list) return;
      list.querySelectorAll("li").forEach(function (li, i) {
        li.classList.toggle("is-focus", i === focusIdx);
        if (i === focusIdx) {
          li.setAttribute("tabindex", "0");
          if (document.activeElement !== li && document.activeElement !== btn) li.focus();
        } else li.setAttribute("tabindex", "-1");
      });
    }
    if (btn && list) {
      HERO_PRESETS.forEach(function (p) {
        var li = document.createElement("li");
        li.setAttribute("role", "option");
        li.setAttribute("tabindex", "-1");
        li.setAttribute("data-preset", p.id);
        li.setAttribute("aria-selected", p.id === cur ? "true" : "false");
        var dot = document.createElement("i");
        dot.style.background = p.dot;
        dot.setAttribute("aria-hidden", "true");
        li.appendChild(dot);
        li.appendChild(document.createTextNode(p.name));
        li.addEventListener("click", function () { setPreset(p.id, true); closeList(true); start(); });
        li.addEventListener("keydown", function (ev) {
          if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); setPreset(p.id, true); closeList(true); start(); }
          else if (ev.key === "Escape") { ev.preventDefault(); closeList(true); }
          else if (ev.key === "ArrowDown") { ev.preventDefault(); focusIdx = (focusIdx + 1) % HERO_PRESETS.length; paintFocus(); }
          else if (ev.key === "ArrowUp") { ev.preventDefault(); focusIdx = (focusIdx + HERO_PRESETS.length - 1) % HERO_PRESETS.length; paintFocus(); }
        });
        list.appendChild(li);
      });
      syncSwitcher();
      btn.addEventListener("click", function () { if (isOpen()) closeList(false); else openList(); });
      btn.addEventListener("keydown", function (ev) {
        if (ev.key === "ArrowDown" || ev.key === "Enter" || ev.key === " ") {
          if (!isOpen()) { ev.preventDefault(); openList(); }
        } else if (ev.key === "Escape" && isOpen()) { ev.preventDefault(); closeList(false); }
        else if (ev.key === "ArrowUp" && isOpen()) { ev.preventDefault(); focusIdx = HERO_PRESETS.length - 1; paintFocus(); }
      });
      document.addEventListener("click", function (e) {
        if (isOpen() && e.target !== btn && !btn.contains(e.target) && !list.contains(e.target)) closeList(false);
      });
      document.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape" && isOpen()) { ev.preventDefault(); closeList(true); }
      });
    }
    function init() {
      if (inited) return;
      inited = true;
      size();
      paintOnce(); // first frame immediately; motion follows unless reduced-motion
      start();
    }
    // 23 · init canvas nodes when idle (fallback: first scroll or timeout).
    // 24 · pause the canvas while the hero is offscreen.
    function deferInit() {
      if (inited) return;
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(init, { timeout: 1500 });
      } else {
        var onFirst = function () { window.removeEventListener("scroll", onFirst); init(); };
        window.addEventListener("scroll", onFirst, { passive: true });
        window.setTimeout(init, 1500);
      }
    }
    if ("IntersectionObserver" in window && canvas.parentElement) {
      var heroIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          heroVisible = e.isIntersecting;
          if (heroVisible) start(); else stop();
        });
      });
      heroIO.observe(canvas.parentElement);
    }
    deferInit();
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
    window.addEventListener("resize", function () { if (inited) { size(); paintOnce(); } });
  }

  // Fullscreen section controller — ONE source of truth: goToSection(index).
  // Wheel / keyboard / touch / dots / buttons all funnel through it.
  // Exactly one section per gesture: nav lock + cooldown + wheel-accumulator
  // threshold defeat trackpad bursts. Boundary-locked: no overscroll.
  // Internal scroll regions ([data-scroll-isolate]) consume their own wheel
  // until they hit an edge; section nav only fires at the edge.
  var FsState = { index: 0, animating: false, cooldownUntil: 0, wheelAcc: 0, wheelResetT: 0 };
  var FS_DURATION = 680;
  var FS_COOLDOWN = 950;
  var WHEEL_THRESHOLD = 45;
  var TOUCH_THRESHOLD = 60;

  function setupFullscreenNav() {
    var stage = document.getElementById("main");
    var secs = Array.prototype.slice.call(document.querySelectorAll("main > section.FsSection"));
    if (!stage || !secs.length) return;
    var dots = Array.prototype.slice.call(document.querySelectorAll("#fsDots [data-goto]"));
    var counter = document.getElementById("fsCurrent");
    var footer = document.querySelector(".FsFooter");
    var reduced = function () {
      return (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) || reduceMotion;
    };

    function paint() {
      secs.forEach(function (s, i) {
        s.classList.toggle("is-active", i === FsState.index);
        s.classList.toggle("is-before", i < FsState.index);
        s.classList.toggle("is-after", i > FsState.index);
        if (i === FsState.index) s.removeAttribute("inert");
        else s.setAttribute("inert", "");
      });
      // Force-reveal scroll-triggered content in the active slide: its
      // IntersectionObservers may have been armed while it was hidden.
      var active = secs[FsState.index];
      if (active) {
        active.querySelectorAll(".Reveal:not(.is-in)").forEach(function (el) { el.classList.add("is-in"); });
        active.querySelectorAll(".is-flow-hidden").forEach(function (el) { el.classList.remove("is-flow-hidden"); el.classList.add("is-flow-in"); });
        active.querySelectorAll(".is-card-hidden").forEach(function (el) { el.classList.remove("is-card-hidden"); el.classList.add("is-card-in"); });
        active.querySelectorAll(".is-tl-hidden").forEach(function (el) { el.classList.remove("is-tl-hidden"); el.classList.add("is-tl-in"); });
        active.querySelectorAll(".is-feed-hidden").forEach(function (el) { el.classList.remove("is-feed-hidden"); el.classList.add("is-feed-in"); });
        active.querySelectorAll(".is-branch-hidden").forEach(function (el) { el.classList.remove("is-branch-hidden"); el.classList.add("is-branch-in"); });
        active.querySelectorAll(".is-check-hidden").forEach(function (el) { el.classList.remove("is-check-hidden"); el.classList.add("is-check-in"); });
        active.querySelectorAll(".is-connectors-in").forEach(function () { /* already on */ });
        var flow = active.querySelector(".OrchFlow");
        if (flow) flow.classList.add("is-connectors-in");
        var steps = active.querySelector(".FlowSteps");
        if (steps) steps.classList.add("is-connectors-in");
        var ag = active.querySelector(".AgentGraph");
        if (ag) ag.classList.add("is-connectors-in");
        var tl = active.querySelector(".TrustTimeline");
        if (tl) tl.classList.add("is-timeline-in");
      }
      dots.forEach(function (d) {
        var on = Number(d.getAttribute("data-goto")) === FsState.index;
        d.classList.toggle("is-current", on);
        if (on) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
      if (counter) counter.textContent = ("0" + (FsState.index + 1)).slice(-2);
      if (footer) footer.classList.toggle("is-visible", FsState.index === secs.length - 1);
      if (FsState.index > 0) stage.classList.add("has-moved");
      try {
        if (window.sessionStorage) sessionStorage.setItem("agentos.home.section", String(FsState.index));
      } catch (err) { /* never break page */ }
    }

    function unlock() {
      FsState.animating = false;
      FsState.cooldownUntil = Date.now() + (FS_COOLDOWN - FS_DURATION);
    }

    window.goToSection = function (i) {
      i = Math.max(0, Math.min(secs.length - 1, i));
      if (i === FsState.index) return FsState.index;
      if (FsState.animating || Date.now() < FsState.cooldownUntil) return FsState.index;
      FsState.index = i;
      FsState.wheelAcc = 0;
      if (reduced()) { paint(); FsState.cooldownUntil = Date.now() + 120; return FsState.index; }
      FsState.animating = true;
      paint();
      window.setTimeout(unlock, FS_DURATION);
      return FsState.index;
    };
    function next() { return window.goToSection(FsState.index + 1); }
    function prev() { return window.goToSection(FsState.index - 1); }

    // Always start at Section 01 (fresh, deterministic entry).
    FsState.index = 0;
    paint();

    function isolateTarget(el) {
      if (!el || !el.closest) return null;
      return el.closest("[data-scroll-isolate]");
    }
    function canScroll(el, dir) {
      // dir: +1 down/right, -1 up/left. Vertical gate for section nav.
      if (!el) return false;
      if (el.scrollHeight > el.clientHeight + 2) {
        if (dir > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 2) return true;
        if (dir < 0 && el.scrollTop > 2) return true;
      }
      if (el.scrollWidth > el.clientWidth + 2) return true; // horizontal diagram: never hijack
      return false;
    }

    // Wheel: accumulate deltas (trackpad bursts), one nav per gesture.
    window.addEventListener("wheel", function (ev) {
      if (ev.ctrlKey || ev.metaKey) return; // pinch-zoom: never hijack
      if (FsState.animating || Date.now() < FsState.cooldownUntil) { ev.preventDefault(); return; }
      var iso = isolateTarget(ev.target);
      var dir = (ev.deltaY || 0) > 0 ? 1 : (ev.deltaY || 0) < 0 ? -1 : 0;
      if (Math.abs(ev.deltaY) < Math.abs(ev.deltaX)) return; // horizontal: leave to diagram
      if (dir === 0) return;
      if (iso && canScroll(iso, dir)) return; // internal region consumes it
      ev.preventDefault();
      var now = Date.now();
      if (now - FsState.wheelResetT > 220) FsState.wheelAcc = 0;
      FsState.wheelResetT = now;
      FsState.wheelAcc += ev.deltaY;
      if (Math.abs(FsState.wheelAcc) < WHEEL_THRESHOLD) return;
      FsState.wheelAcc = 0;
      if (dir > 0) next(); else prev();
    }, { passive: false });

    // Touch: single swipe = exactly one section.
    var touchY = null;
    window.addEventListener("touchstart", function (ev) {
      if (ev.touches && ev.touches.length === 1) touchY = ev.touches[0].clientY;
    }, { passive: true });
    window.addEventListener("touchend", function (ev) {
      if (touchY == null) return;
      var endY = ev.changedTouches && ev.changedTouches[0] ? ev.changedTouches[0].clientY : touchY;
      var dy = touchY - endY;
      touchY = null;
      if (Math.abs(dy) < TOUCH_THRESHOLD) return;
      if (FsState.animating || Date.now() < FsState.cooldownUntil) return;
      var iso = isolateTarget(ev.target);
      if (iso && canScroll(iso, dy > 0 ? 1 : -1)) return;
      if (dy > 0) next(); else prev();
    }, { passive: true });

    // Keyboard: arrows / pgup-pgdn / space / home / end. One press = one section.
    document.addEventListener("keydown", function (ev) {
      if (ev.defaultPrevented || ev.ctrlKey || ev.metaKey || ev.altKey) return;
      var tag = (ev.target && ev.target.tagName) || "";
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
      if (ev.target && ev.target.isContentEditable) return;
      var inTablist = ev.target && ev.target.closest && ev.target.closest('[role="tablist"]');
      var k = ev.key;
      var handled = true;
      if (k === "ArrowDown" && !inTablist) next();
      else if (k === "ArrowUp" && !inTablist) prev();
      else if (k === "PageDown") next();
      else if (k === "PageUp") prev();
      else if ((k === " " || k === "Spacebar") && !(ev.target && ev.target.closest && ev.target.closest("button, a, [role='tab']"))) {
        if (ev.shiftKey) prev(); else next();
      }
      else if (k === "Home" && !inTablist) window.goToSection(0);
      else if (k === "End" && !inTablist) window.goToSection(secs.length - 1);
      else handled = false;
      if (handled) ev.preventDefault();
    });

    // Dots, nav links, CTAs, footer links, scroll cue: same controller.
    document.addEventListener("click", function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest("[data-goto]") : null;
      if (!btn) return;
      var href = btn.getAttribute("href");
      if (btn.tagName === "A" && href && href.charAt(0) === "#") ev.preventDefault();
      else if (btn.tagName === "BUTTON") ev.preventDefault();
      var i = parseInt(btn.getAttribute("data-goto"), 10);
      if (!isNaN(i)) window.goToSection(i);
      if (typeof setNav === "function") setNav(false);
    });

    // Feed "show all" must not leak into section nav: mark expanded for CSS cap.
    var feed = document.getElementById("activityFeed");
    var feedToggle = document.getElementById("feedToggle");
    if (feedToggle && feed) {
      feedToggle.addEventListener("click", function () {
        var expanded = feedToggle.getAttribute("aria-expanded") === "true";
        feed.parentElement.classList.toggle("expanded", expanded);
        feed.closest(".ExecutionPreview-feed").classList.toggle("expanded", expanded);
      });
    }
    // Reveal current slide's one-shot animations when it becomes active.
    // (paint() already force-reveals hidden states; this triggers the
    // execution-graph activation on first arrival at Section 02.)
    var seenSlides = {};
    function fireSlide(i) {
      if (seenSlides[i]) return;
      seenSlides[i] = true;
      if (i === 1 && typeof activateNodes === "function") activateNodes();
    }
    var origGo = window.goToSection;
    window.goToSection = function (i) {
      var r = origGo(i);
      fireSlide(FsState.index);
      return r;
    };
    // Replay run (Section 06): jump back to the live execution slide.
    var replayBtn = document.getElementById("ctaReplay");
    if (replayBtn) replayBtn.addEventListener("click", function () { window.goToSection(1); });
    fireSlide(FsState.index);
  }

  // 18 · audit-log copy: clipboard API with fallback, aria-live confirmation.
  var auditCopy = document.getElementById("auditCopy");
  var auditCode = document.getElementById("auditCode");
  var auditConfirm = document.getElementById("auditConfirm");
  function confirmCopy(msg) {
    if (!auditConfirm) return;
    auditConfirm.textContent = msg;
    window.setTimeout(function () { if (auditConfirm.textContent === msg) auditConfirm.textContent = ""; }, 2000);
  }
  if (auditCopy && auditCode) {
    auditCopy.addEventListener("click", function () {
      var text = auditCode.textContent;
      function done() { confirmCopy(t("deploy.copied")); }
      function fallback() {
        try {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "absolute";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          done();
        } catch (err) { confirmCopy(t("deploy.copy_failed")); }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    });
  }

  // 21 · keyboard arrow scrolling for both scroll regions (tabindex + role + aria-label are in markup).
  function arrowScroll(el) {
    el.addEventListener("keydown", function (ev) {
      var step = 48;
      var x = 0, y = 0;
      if (ev.key === "ArrowRight") x = step;
      else if (ev.key === "ArrowLeft") x = -step;
      else if (ev.key === "ArrowDown") y = step;
      else if (ev.key === "ArrowUp") y = -step;
      else return;
      ev.preventDefault();
      if (el.scrollBy) el.scrollBy({ left: x, top: y, behavior: "auto" });
      else { el.scrollLeft += x; el.scrollTop += y; }
    });
  }
  function setupArrowScroll() {
    var previewScrollEl = document.getElementById("previewScroll");
    if (previewScrollEl) arrowScroll(previewScrollEl);
    var orchScroll = document.querySelector(".Orchestration-scroll");
    if (orchScroll) arrowScroll(orchScroll);
  }

  // 24 · mark animated sections in view so offscreen artifacts stay static until visible.
  function setupInView() {
    var sections = document.querySelectorAll(".ExecutionPreview, .FlowSteps, .CtaDemo");
    if (!sections.length) return;
    if (!canObserve) {
      sections.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); vio.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    sections.forEach(function (el) { vio.observe(el); });
  }

  setupHeroBg();
  setupFullscreenNav();
  setupReveal();
  setupFeed();
  setupOrchestration();
  setupCards();
  setupTimeline();
  setupChecklist();
  setupScrollspy();
  setupArrowScroll();
  setupInView();
  // 0b. Language switcher last: restores persisted lang (pre-set on <html>
  // by the head init) and re-renders all keyed strings + dynamic labels.
  setupLang();
  applyLang();
})();
