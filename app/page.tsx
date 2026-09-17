"use client";

import { useEffect, useState } from "react";
import {
  Activity, ArrowRight, BookOpen, CalendarDays, Check, ChevronRight,
  ClipboardCheck, GraduationCap, Headphones, Home, LayoutDashboard,
  Library, ListChecks, MessageCircle, Mic, Pause, Play, Plus, Search,
  Settings, ShieldCheck, Sparkles, Target, UsersRound, Volume2, AudioWaveform,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Role = "student" | "teacher" | "admin";
type View = "home" | "training" | "assessment" | "courses" | "records";
const nav = [
  { id: "home", label: "首页", icon: Home }, { id: "training", label: "训练", icon: Target },
  { id: "assessment", label: "评估", icon: ClipboardCheck }, { id: "courses", label: "课程", icon: BookOpen },
  { id: "records", label: "记录", icon: CalendarDays },
] as const;

function Brand() {
  return <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-[14px] bg-[#147d87] text-white shadow-[0_7px_20px_rgba(20,125,135,.24)]"><AudioWaveform className="size-5" /></div><div><b className="text-[17px] tracking-[-.03em] text-[#14313d]">流畅说</b><p className="text-[11px] font-medium tracking-[.12em] text-[#85959b]">每天进步一点</p></div></div>;
}

function Header({ role, setRole }: { role: Role; setRole: (r: Role) => void }) {
  return <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#e3ecee] bg-[#f7fafb]/95 px-4 backdrop-blur-md sm:px-7">
    <div className="lg:hidden"><Brand /></div><div className="hidden items-center gap-2 text-sm text-[#7c8d93] lg:flex"><ShieldCheck className="size-4 text-[#147d87]" />训练内容由指导老师为你安排</div>
    <div className="flex items-center gap-3"><Select value={role} onValueChange={(v) => setRole(v as Role)}><SelectTrigger aria-label="切换演示角色" className="h-10 w-[128px] rounded-xl border-[#dce7ea] bg-white shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="student">学员端</SelectItem><SelectItem value="teacher">教师端</SelectItem><SelectItem value="admin">管理端</SelectItem></SelectContent></Select><div className="hidden items-center gap-2.5 border-l border-[#dde7ea] pl-3 sm:flex"><div className="grid size-9 place-items-center rounded-xl bg-[#dbeeed] text-sm font-bold text-[#116d76]">林</div><div className="hidden xl:block"><p className="text-sm font-semibold">林晓雨</p><p className="text-[11px] text-[#829399]">正式学员</p></div></div></div>
  </header>;
}

function Sidebar({ view, setView }: { view: View; setView: (v: View) => void }) {
  return <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-[#e3ecee] bg-white px-5 py-7 lg:flex"><Brand /><nav className="mt-10 space-y-1.5">{nav.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setView(id)} className={"flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-medium " + (view === id ? "bg-[#e9f5f5] text-[#116d76]" : "text-[#64767d] hover:bg-[#f4f7f8]")}><Icon className="size-[19px]" />{label}{id === "training" && <span className="ml-auto grid size-5 place-items-center rounded-full bg-[#147d87] text-[11px] text-white">2</span>}</button>)}</nav><div className="mt-auto rounded-2xl bg-[#f3f8f8] p-4"><p className="flex items-center gap-2 text-sm font-semibold"><Headphones className="size-4 text-[#147d87]" />需要帮助？</p><p className="mt-2 text-[12px] leading-5 text-[#71848a]">训练中遇到问题，可以随时联系你的指导老师。</p><button className="mt-3 text-[13px] font-semibold text-[#147d87]">联系老师</button></div><button className="mt-4 flex items-center gap-3 px-3 py-2 text-sm text-[#71848a]"><Settings className="size-4" />设置</button></aside>;
}

function TrainingModal({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [recording, setRecording] = useState(false); const [step, setStep] = useState(3);
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-[560px] overflow-hidden rounded-3xl border-0 p-0"><div className="bg-[#14313d] px-6 py-5 text-white"><DialogHeader><div className="mb-3 flex justify-between pr-8 text-xs text-white/60"><span>发音与节奏训练</span><span>{step} / 10</span></div><DialogTitle className="text-left text-xl">轻声连读练习</DialogTitle><DialogDescription className="text-left text-white/60">放松肩颈，匀速读出词语，不需要追求速度。</DialogDescription></DialogHeader></div><div className="px-6 pb-7 pt-6"><Progress value={step * 10} className="h-1.5 bg-[#dcebea] [&>div]:bg-[#21a2a8]" /><div className="my-8 text-center"><p className="text-sm text-[#87979c]">请朗读</p><p className="mt-3 text-[32px] font-bold tracking-[.13em] text-[#173642]">北京 · 爸爸 · 苹果</p></div><button onClick={() => setRecording(!recording)} aria-label={recording ? "暂停录音" : "开始录音"} className={"mx-auto grid size-[84px] place-items-center rounded-full border-[7px] text-white " + (recording ? "border-[#fee5e2] bg-[#e75d50]" : "border-[#dff1f1] bg-[#147d87]")}>{recording ? <Pause className="size-7 fill-current" /> : <Mic className="size-7" />}</button><p className="mt-4 text-center text-sm font-medium text-[#61767d]">{recording ? "正在录音 · 00:08" : "点击开始录音"}</p><button onClick={() => { setRecording(false); setStep((v) => Math.min(10, v + 1)); }} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#14313d] py-3.5 text-sm font-semibold text-white">保存并继续<ArrowRight className="size-4" /></button></div></DialogContent></Dialog>;
}

function TrainingCard({ start }: { start: () => void }) {
  const tasks = [
    [Volume2, "发音与节奏", "轻声连读练习 · 8 分钟", "继续训练", "teal"],
    [Sparkles, "放松训练", "身体扫描与呼吸 · 5 分钟", "已完成", "done"],
    [MessageCircle, "情境表达", "模拟电话预约 · 10 分钟", "待开始", "navy"],
  ] as const;
  return <section className="rounded-[22px] border border-[#e0eaed] bg-white p-5 shadow-[0_10px_35px_rgba(36,77,91,.055)] sm:p-6"><div className="mb-5 flex items-start justify-between"><div><div className="flex items-center gap-2"><h2 className="text-lg font-bold">今日训练</h2><span className="rounded-full bg-[#fff0df] px-2.5 py-1 text-[11px] font-semibold text-[#b76a15]">2 项待完成</span></div><p className="mt-1.5 text-sm text-[#84949a]">约 18 分钟，按自己的节奏来</p></div><div className="grid size-14 place-items-center rounded-full bg-[conic-gradient(#178791_0_42%,#e5eeee_42%_100%)]"><div className="grid size-[44px] place-items-center rounded-full bg-white text-[13px] font-bold text-[#147d87]">1/3</div></div></div><div className="space-y-2.5">{tasks.map(([Icon,title,detail,state,tone], i) => <button key={title} onClick={i === 0 ? start : undefined} className="flex w-full items-center gap-3.5 rounded-2xl border border-[#e6edef] p-3.5 text-left hover:border-[#b9d8db] sm:p-4"><span className={"grid size-11 shrink-0 place-items-center rounded-xl " + (tone === "done" ? "bg-[#eaf5ec] text-[#4e9964]" : tone === "teal" ? "bg-[#dff1f1] text-[#147d87]" : "bg-[#e8eef1] text-[#315c6b]")}>{tone === "done" ? <Check className="size-5" /> : <Icon className="size-5" />}</span><span className="min-w-0 flex-1"><b className="block text-[15px]">{title}</b><span className="block truncate text-[12px] text-[#8a9a9f]">{detail}</span></span><span className={"hidden text-[12px] font-semibold sm:inline " + (tone === "done" ? "text-[#68a579]" : "text-[#147d87]")}>{state}</span>{tone !== "done" && <ChevronRight className="size-4 text-[#9aacb1]" />}</button>)}</div></section>;
}

function StudentHome({ start }: { start: () => void }) {
  const days = [["一","14",true],["二","15",true],["三","16",true],["四","17",false],["五","18",false],["六","19",false],["日","20",false]] as const;
  return <div className="mx-auto max-w-[1180px] px-4 pb-28 pt-7 sm:px-7 sm:pt-9 lg:pb-10"><div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-[#147d87]">9 月 17 日 · 星期四</p><h1 className="text-[30px] font-bold tracking-[-.035em] text-[#14313d]">早上好，晓雨</h1><p className="mt-2 text-[15px] text-[#74878e]">今天也不用着急，我们慢慢说。</p></div><div className="flex w-fit items-center gap-3 rounded-2xl border border-[#e0eaed] bg-white px-4 py-3"><div className="grid size-9 place-items-center rounded-xl bg-[#fff3df] text-[#c2771f]"><Activity className="size-[18px]" /></div><div><p className="text-[11px] text-[#8a999e]">连续训练</p><b className="text-sm">12 天</b></div></div></div><div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,.8fr)]"><div className="space-y-5"><TrainingCard start={start} /><section className="rounded-[22px] border border-[#e0eaed] bg-white p-5 sm:p-6"><div className="mb-5 flex justify-between"><div><h2 className="text-lg font-bold">本周节奏</h2><p className="text-sm text-[#87979c]">已完成 3 天，坚持得很稳</p></div><button className="text-[13px] font-semibold text-[#147d87]">查看记录</button></div><div className="grid grid-cols-7 gap-2">{days.map(([d,n,done],i) => <div key={n} className="text-center"><p className="mb-2 text-[11px] text-[#94a2a7]">周{d}</p><div className={"mx-auto grid size-9 place-items-center rounded-xl text-[13px] font-semibold sm:size-10 " + (i === 3 ? "bg-[#14313d] text-white" : done ? "bg-[#e4f2f1] text-[#147d87]" : "bg-[#f2f6f7] text-[#87989e]")}>{done ? <Check className="size-4" /> : n}</div></div>)}</div></section><section className="flex flex-col gap-5 rounded-[22px] bg-[#14313d] p-6 text-white sm:flex-row sm:items-center"><div className="grid size-12 place-items-center rounded-2xl bg-white/10"><Play className="size-5 fill-white" /></div><div className="flex-1"><p className="text-xs text-[#7ed0d0]">继续学习 · 第 2 章</p><h3 className="mt-1.5 text-lg font-semibold">在紧张出现时，如何放慢表达</h3><p className="text-[13px] text-white/55">已学习 12 分钟 · 剩余 8 分钟</p></div><button className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#14313d]">继续观看</button></section></div><aside className="space-y-5"><section className="rounded-[22px] border border-[#e0eaed] bg-white p-5"><div className="flex justify-between"><div><b className="text-sm">当前训练阶段</b><p className="text-xs text-[#8a9a9f]">第 2 阶段 · 稳定节奏</p></div><span className="h-fit rounded-lg bg-[#e4f3f2] px-2 py-1 text-[11px] font-semibold text-[#147d87]">第 4 周</span></div><Progress value={62} className="mt-5 h-2 bg-[#e3ecec] [&>div]:bg-[#147d87]" /><div className="mt-2 flex justify-between text-[11px] text-[#8a999e]"><span>本阶段进度</span><span>62%</span></div></section><section className="rounded-[22px] border border-[#e0eaed] bg-white p-5"><div className="mb-4 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#e6eff2] font-bold">周</div><div><b className="text-sm">周老师</b><p className="text-[11px] text-[#8c9ba0]">3 小时前更新</p></div></div><p className="rounded-2xl bg-[#f3f7f8] p-4 text-[13px] leading-6 text-[#526a73]">这周你的语速控制更稳定了。继续留意每个词之间的小停顿，不用赶。</p></section><section className="rounded-[22px] border border-[#e0eaed] bg-white p-5"><b className="text-sm">下次反馈</b><p className="mt-4 text-sm font-semibold">9 月 19 日，19:30</p><p className="text-[11px] text-[#8a999e]">线上 · 约 30 分钟</p></section></aside></div></div>;
}

const sectionData = {
  training: [Target, "训练中心", "按计划完成每日练习，录音会安全保存给指导老师查看。", ["发音与肌群训练","心理放松训练","思维与表达训练"]],
  assessment: [ClipboardCheck, "阶段评估", "评估结果仅用于辅助制定训练计划，不作为医学诊断。", ["基础问卷","朗读录音","评估结果"]],
  courses: [BookOpen, "我的课程", "用短课程理解表达规律，把方法带进每天的练习。", ["认识口吃与紧张","建立稳定的说话节奏","真实场景表达"]],
  records: [CalendarDays, "训练记录", "回看完成情况、录音与老师反馈，看到一点一滴的变化。", ["9 月 17 日 · 今日","9 月 16 日 · 已完成","9 月 15 日 · 已完成"]],
} as const;
function SectionView({ view, start }: { view: Exclude<View,"home">; start: () => void }) {
  const [Icon,title,intro,cards] = sectionData[view];
  return <div className="mx-auto max-w-[1040px] px-4 pb-28 pt-8 sm:px-7"><div className="mb-8 max-w-2xl"><div className="mb-4 grid size-12 place-items-center rounded-2xl bg-[#dff1f1] text-[#147d87]"><Icon className="size-5" /></div><h1 className="text-3xl font-bold">{title}</h1><p className="mt-3 leading-7 text-[#72858c]">{intro}</p></div><div className="grid gap-4 md:grid-cols-3">{cards.map((card,i) => <button key={card} onClick={view === "training" && i === 0 ? start : undefined} className="rounded-[22px] border border-[#e0eaed] bg-white p-5 text-left hover:border-[#b9d8db]"><div className="mb-10 flex justify-between"><span className="text-xs text-[#8c9ba0]">0{i+1}</span>{i === 0 ? <span className="rounded-full bg-[#e7f3f2] px-2.5 py-1 text-[11px] font-semibold text-[#147d87]">进行中</span> : <ChevronRight className="size-4" />}</div><h2 className="font-semibold">{card}</h2><p className="mt-2 text-[13px] text-[#86969b]">查看内容与当前完成进度</p></button>)}</div></div>;
}

function Teacher() {
  const people = [["林晓雨","稳定节奏 · 第 4 周","今日已完成"],["陈一凡","初步评估","评估待查看"],["周子航","情境表达 · 第 2 周","2 天未训练"]];
  return <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-7"><div className="mb-8 flex justify-between"><div><p className="text-sm text-[#147d87]">教师工作台</p><h1 className="text-3xl font-bold">上午好，周老师</h1><p className="text-sm text-[#76888e]">今天有 2 项需要处理。</p></div><button className="hidden h-fit items-center gap-2 rounded-xl bg-[#14313d] px-4 py-3 text-sm font-semibold text-white sm:flex"><Plus className="size-4" />布置训练</button></div><div className="grid gap-5 lg:grid-cols-[1fr_330px]"><section className="rounded-[22px] border border-[#e0eaed] bg-white p-5"><div className="mb-4 flex justify-between"><h2 className="text-lg font-bold">我的学员</h2><Search className="size-4" /></div>{people.map((p,i) => <button key={p[0]} className="flex w-full items-center gap-4 border-t border-[#edf2f3] py-4 text-left first:border-0"><div className="grid size-11 place-items-center rounded-xl bg-[#dff1f1] font-bold text-[#147d87]">{p[0][0]}</div><div className="flex-1"><b className="text-sm">{p[0]}</b><p className="text-xs text-[#8a9a9f]">{p[1]}</p></div><span className={"text-xs font-semibold " + (i ? "text-[#cf715d]" : "text-[#5c9f70]")}>{p[2]}</span></button>)}</section><aside className="rounded-[22px] bg-[#14313d] p-5 text-white"><b>待处理</b><p className="mt-5 flex gap-3 text-sm"><Mic className="size-4 text-[#7ed0d0]" />3 条训练录音</p><p className="mt-4 flex gap-3 text-sm"><ClipboardCheck className="size-4 text-[#7ed0d0]" />1 份新评估</p></aside></div></div>;
}
function Admin() {
  const stats = [["全部学员","248",UsersRound],["活跃教师","12",GraduationCap],["训练完成","1,286",ListChecks],["课程内容","36",Library]] as const;
  return <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-7"><p className="text-sm text-[#147d87]">系统管理</p><h1 className="text-3xl font-bold">运营概览</h1><p className="text-sm text-[#76888e]">用户、教学内容与基础运营状态。</p><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label,value,Icon]) => <section key={label} className="rounded-[22px] border border-[#e0eaed] bg-white p-5"><div className="mb-6 grid size-10 place-items-center rounded-xl bg-[#e6f2f2] text-[#147d87]"><Icon className="size-[18px]" /></div><p className="text-xs text-[#829399]">{label}</p><p className="text-3xl font-bold">{value}</p></section>)}</div><section className="mt-5 rounded-[22px] bg-[#14313d] p-6 text-white"><LayoutDashboard className="size-5 text-[#7ed0d0]" /><h2 className="mt-6 text-lg font-semibold">内容维护</h2><p className="mt-2 text-[13px] text-white/55">管理训练题库、评估问卷、视频课程、用户关系与系统权限。</p></section></div>;
}

function MobileNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  return <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[#e0eaed] bg-white/95 px-2 pb-2 pt-2 lg:hidden">{nav.map(({id,label,icon:Icon}) => <button key={id} onClick={() => setView(id)} className={"flex flex-col items-center gap-1 py-1 text-[10px] " + (view === id ? "text-[#147d87]" : "text-[#87989e]")}><Icon className="size-[19px]" />{label}</button>)}</nav>;
}

export default function HomePage() {
  const [role,setRole] = useState<Role>("student"); const [view,setView] = useState<View>("home"); const [open,setOpen] = useState(false);
  useEffect(() => {
    const context = (document as Document & {
      modelContext?: {
        registerTool: (tool: {
          name: string;
          title: string;
          description: string;
          inputSchema: object;
          annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
          execute: (input: unknown) => unknown;
        }, options?: { signal?: AbortSignal }) => void | Promise<void>;
      };
    }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "start_pronunciation_training",
      title: "开始发音训练",
      description: "切换到学员端，并打开今天的发音与节奏训练。",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).length > 0) {
          throw new Error("此操作不接受参数。");
        }
        setRole("student");
        setView("training");
        setOpen(true);
        return { status: "started", training: "发音与节奏" };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);
  return <main className="min-h-screen bg-[#f7fafb] text-[#183843]">{role === "student" && <Sidebar view={view} setView={setView} />}<div className={role === "student" ? "lg:pl-[232px]" : ""}><Header role={role} setRole={setRole} />{role === "teacher" ? <Teacher /> : role === "admin" ? <Admin /> : view === "home" ? <StudentHome start={() => setOpen(true)} /> : <SectionView view={view} start={() => setOpen(true)} />}</div>{role === "student" && <MobileNav view={view} setView={setView} />}<TrainingModal open={open} setOpen={setOpen} /></main>;
}
