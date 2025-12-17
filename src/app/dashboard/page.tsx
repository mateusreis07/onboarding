import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CheckCircle2, Circle, Clock, AlertTriangle, Calendar, Play, Monitor, BookOpen, Shield, Gift } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MenteeList } from "@/components/dashboard/MenteeList"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Fetch onboarding data for the current user
    const onboarding = await prisma.userOnboarding.findUnique({
        where: { userId: session.user.id },
        include: {
            tasks: {
                where: {
                    OR: [
                        { assigneeRole: "EMPLOYEE" },
                        { assigneeRole: null }
                    ]
                },
                orderBy: {
                    dueDate: 'asc'
                }
            }
        }
    })

    // Fetch Mentees (Buddies)
    const mentees = await prisma.user.findMany({
        where: { buddyId: session.user.id },
        include: {
            onboarding: {
                include: {
                    tasks: {
                        select: {
                            id: true,
                            title: true,
                            status: true
                        },
                        orderBy: { status: 'asc' }
                    }
                }
            }
        }
    })

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
    })

    // Calculate stats
    const tasks = onboarding?.tasks || []
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
    const pendingTasks = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length
    const overdueTasks = tasks.filter(t => t.status === 'OVERDUE').length

    // Calculate progress (Use DB value or calculate)
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const isAllCompleted = totalTasks > 0 && completedTasks === totalTasks

    // If no onboarding, we want to show a clean dashboard with notifications
    const showOnboardingContent = !!onboarding

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* 1. Welcome Hero */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-3xl">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">
                        Bem-vindo ao Time, {session.user.name?.split(' ')[0] || "Colaborador"}! 🚀
                    </h1>
                    <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                        Estamos muito felizes em tê-lo conosco. Este é o seu Portal do Colaborador,
                        o centro de comando para sua jornada de integração. Explore, aprenda e prepare-se para decolar!
                    </p>
                </div>
                {/* Decorative circle */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 2. Institutional: Video & Values */}
                    <section className="grid md:grid-cols-2 gap-6">
                        <Card className="overflow-hidden border-none shadow-md bg-zinc-900 text-white group cursor-pointer hover:shadow-xl transition-all">
                            <div className="relative h-48 bg-black flex items-center justify-center">
                                <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                                <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform" fill="currentColor" />
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-bold text-lg mb-1">Palavra do CEO</h3>
                                <p className="text-zinc-400 text-sm">Conheça nossa visão e onde queremos chegar.</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-indigo-600" />
                                    Nossa Cultura e Missão
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-gray-600">
                                <p><strong>Missão:</strong> Transformar a tecnologia em soluções que impactam vidas.</p>
                                <p><strong>Valores:</strong></p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Inovação contínua</li>
                                    <li>Transparência radical</li>
                                    <li>Foco no cliente</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </section>

                    {/* 3. Onboarding Progress & Timeline */}
                    <div id="timeline">
                        {showOnboardingContent ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-blue-600" />
                                            Seu Progresso
                                        </h2>
                                        <span className="text-2xl font-bold text-blue-600">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3">
                                        <div
                                            className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="mt-4 flex gap-4 text-sm text-gray-500">
                                        <span><strong>{completedTasks}</strong> concluídas</span>
                                        <span><strong>{pendingTasks}</strong> pendentes</span>
                                    </div>
                                </div>

                                {/* Scrollable Timeline */}
                                <div className="p-6 bg-gray-50/50 max-h-[500px] overflow-y-auto">
                                    <div className="relative pl-2">
                                        <div className="absolute top-2 bottom-2 left-[19px] w-0.5 bg-gray-200"></div>
                                        <div className="space-y-6">
                                            {tasks.map((task) => {
                                                const isDone = task.status === 'COMPLETED';
                                                return (
                                                    <div key={task.id} className={`relative flex items-start group ${isDone ? 'opacity-70' : ''}`}>
                                                        <div className="z-10 bg-gray-50/50 py-1 pr-4">
                                                            {isDone ? (
                                                                <CheckCircle2 className="w-10 h-10 text-green-500 bg-white rounded-full border-4 border-gray-50" />
                                                            ) : (
                                                                <Circle className="w-10 h-10 text-blue-600 bg-white rounded-full border-4 border-gray-50" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                            <h4 className="font-semibold text-gray-900">{task.title}</h4>
                                                            <p className="text-sm text-gray-500 mt-1 mb-2">{task.description}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${task.type === 'TRAINING' ? 'bg-purple-100 text-purple-700' :
                                                                    task.type === 'DOCUMENT_UPLOAD' ? 'bg-amber-100 text-amber-700' :
                                                                        'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {task.type === 'TRAINING' ? 'Treinamento' :
                                                                        task.type === 'DOCUMENT_UPLOAD' ? 'Documentação' : 'Tarefa'}
                                                                </span>
                                                                {task.dueDate && (
                                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3" />
                                                                        {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                                <p className="text-gray-500">Nenhum processo de onboarding ativo.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">

                    {/* Meus Afilhados Panel */}
                    <MenteeList mentees={mentees as any} />

                    {/* 5. Notifications Panel */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Notificações</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {notifications.length === 0 ? (
                                <p className="text-sm text-gray-500">Tudo limpo por aqui.</p>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} className="p-3 bg-gray-50 rounded border border-gray-100 text-sm">
                                        <p className="font-medium text-gray-900">{n.title}</p>
                                        <p className="text-gray-500 mt-1">{n.message}</p>
                                        <p className="text-xs text-gray-400 mt-2">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(n.createdAt)}</p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* 6. Equipment Kit (Mock) */}
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Gift className="w-5 h-5 text-indigo-500" />
                                Seu Kit de Boas-Vindas
                            </CardTitle>
                            <CardDescription>Equipamentos preparados para você:</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-md shadow-sm text-slate-600"><Monitor className="w-4 h-4" /></div>
                                    <span className="text-slate-700">MacBook Pro M3</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-md shadow-sm text-slate-600"><Monitor className="w-4 h-4" /></div>
                                    <span className="text-slate-700">Monitor 4K 27"</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-md shadow-sm text-slate-600"><BookOpen className="w-4 h-4" /></div>
                                    <span className="text-slate-700">Kit Moleskine & Caneta</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* 7. Featured Library */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Biblioteca & Recursos</CardTitle>
                            <CardDescription>Acesse manuais, políticas e vídeos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Link href="/dashboard/documents" className="block p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                                            <BookOpen className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-indigo-900">Manual do Colaborador</p>
                                            <p className="text-xs text-indigo-600">Leitura obrigatória</p>
                                        </div>
                                    </div>
                                </Link>
                                <Link href="/dashboard/documents" className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                                            <Play className="w-4 h-4 ml-0.5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-purple-900">Vídeos de Integração</p>
                                            <p className="text-xs text-purple-600">Assista agora</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            <Link href="/dashboard/documents" className="block">
                                <Button className="w-full" variant="outline">
                                    Acessar Biblioteca Completa
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}
