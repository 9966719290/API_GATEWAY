import './App.css'
import { useState, useEffect, useRef } from 'react'
import {
  Activity, ArrowUpRight, ArrowDownRight, Bell,
  Check, ChevronDown, Clock3, Code2, Copy,
  Database, FileText, Gauge, Globe2, LayoutDashboard,
  LockKeyhole, Menu, Play, Plus, Search, Server,
  Settings, ShieldCheck, SlidersHorizontal, Terminal,
  Users, X, Zap, Route as RouteIcon, RefreshCw,
  Trash2, CircleHelp, AlertTriangle
} from 'lucide-react'

import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar
} from 'recharts'

const initialRoutes = [
  { id: 1, method: 'GET', path: '/api/users', service: 'User Service', auth: true, status: 'Active' },
  { id: 2, method: 'POST', path: '/api/users', service: 'User Service', auth: true, status: 'Active' },
  { id: 3, method: 'GET', path: '/api/orders', service: 'Order Service', auth: true, status: 'Active' },
  { id: 4, method: 'GET', path: '/api/products', service: 'Product Service', auth: false, status: 'Active' },
  { id: 5, method: 'GET', path: '/api/health', service: 'System Service', auth: false, status: 'Active' }
]

const initialUsers = [
  { id: 101, name: 'Alex Morgan', email: 'alex@example.com', role: 'Admin' },
  { id: 102, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Developer' },
  { id: 103, name: 'John Carter', email: 'john@example.com', role: 'Developer' }
]

const products = [
  { id: 1, name: 'Laptop Pro', price: 1299 },
  { id: 2, name: 'Wireless Headphones', price: 199 },
  { id: 3, name: 'Mechanical Keyboard', price: 149 }
]

const chartData = [
  { time: '09:00', requests: 420 },
  { time: '10:00', requests: 680 },
  { time: '11:00', requests: 540 },
  { time: '12:00', requests: 920 },
  { time: '13:00', requests: 760 },
  { time: '14:00', requests: 1100 },
  { time: '15:00', requests: 890 },
  { time: '16:00', requests: 1350 },
  { time: '17:00', requests: 1050 }
]

const initialServices = [
  { name: 'User Service', url: 'user-service.internal', port: 3001, health: 'Healthy', uptime: '99.99%' },
  { name: 'Order Service', url: 'order-service.internal', port: 3002, health: 'Healthy', uptime: '99.95%' },
  { name: 'Product Service', url: 'product-service.internal', port: 3003, health: 'Healthy', uptime: '99.98%' },
  { name: 'System Service', url: 'system-service.internal', port: 3004, health: 'Healthy', uptime: '100%' }
]

const navigation = [
  { title: 'OVERVIEW', items: [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'API Playground', icon: Terminal }
  ]},
  { title: 'MANAGEMENT', items: [
    { name: 'Routes', icon: RouteIcon },
    { name: 'Services', icon: Server },
    { name: 'Consumers', icon: Users },
    { name: 'Rate Limits', icon: Gauge }
  ]},
  { title: 'MONITORING', items: [
    { name: 'Analytics', icon: Activity },
    { name: 'Logs', icon: FileText }
  ]},
  { title: 'SYSTEM', items: [
    { name: 'Settings', icon: Settings }
  ]}
]

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function Badge({ children, type = 'green' }) {
  return <span className={`badge ${type}`}>{children}</span>
}

function StatCard({ label, value, change, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className="stat-icon" style={{ color, background: `${color}18` }}>
          <Icon size={19}/>
        </div>
      </div>
      <h2>{value}</h2>
      <div className="stat-bottom">
        <span className="positive"><ArrowUpRight size={14}/> {change}</span>
        <span>vs last period</span>
      </div>
    </div>
  )
}

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [routes, setRoutes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gateway_routes')) || initialRoutes
    } catch {
      return initialRoutes
    }
  })
  const [services, setServices] = useState(initialServices)
  const [users, setUsers] = useState(initialUsers)
  const [logs, setLogs] = useState([])
  const [requestCount, setRequestCount] = useState(12849)
  const [errorCount, setErrorCount] = useState(23)
  const [rateLimit, setRateLimit] = useState(5)
  const [method, setMethod] = useState('GET')
  const [endpoint, setEndpoint] = useState('/api/users')
  const [token, setToken] = useState('demo_token')
  const [requestBody, setRequestBody] = useState('{\n  "name": "New User",\n  "email": "new@example.com"\n}')
  const [response, setResponse] = useState(null)
  const [pipeline, setPipeline] = useState([])
  const [processing, setProcessing] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [newRoute, setNewRoute] = useState(false)
  const [routePath, setRoutePath] = useState('/api/new')
  const [routeMethod, setRouteMethod] = useState('GET')
  const [routeService, setRouteService] = useState('User Service')
  const [toast, setToast] = useState('')
  const [theme, setTheme] = useState('dark')

  const rateRef = useRef({ count: 0, started: Date.now() })
  const cacheRef = useRef(new Map())
  const roundRobinRef = useRef(0)

  useEffect(() => {
    localStorage.setItem('gateway_routes', JSON.stringify(routes))
  }, [routes])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const notify = message => setToast(message)

  const pipelineSteps = [
    { name: 'Authentication', detail: 'Validate API credentials', icon: ShieldCheck },
    { name: 'Rate Limiting', detail: 'Check request quota', icon: Gauge },
    { name: 'Route Matching', detail: 'Find registered endpoint', icon: RouteIcon },
    { name: 'Cache Check', detail: 'Check stored response', icon: Database },
    { name: 'Backend Processing', detail: 'Execute simulated service', icon: Server }
  ]

  const finishRequest = (status, data, latency, server, cached = false) => {
    const result = {
      status,
      latency,
      data,
      server,
      cached,
      timestamp: new Date().toLocaleTimeString()
    }

    setResponse(result)

    const log = {
      id: Date.now(),
      method,
      endpoint,
      status,
      latency,
      timestamp: new Date().toLocaleTimeString(),
      server
    }

    setLogs(prev => [log, ...prev].slice(0, 100))
    setRequestCount(prev => prev + 1)

    if (status >= 400) setErrorCount(prev => prev + 1)

    setProcessing(false)
  }

  const runRequest = async () => {
    if (processing) return

    setProcessing(true)
    setResponse(null)
    setPipeline(pipelineSteps.map(step => ({ ...step, status: 'pending' })))

    const started = performance.now()
    const pause = () => sleep(350)

    const completeStep = (index, status) => {
      setPipeline(prev => prev.map((step, i) =>
        i === index ? { ...step, status } : step
      ))
    }

    const fail = async (index, status, message) => {
      completeStep(index, 'failed')
      await pause()
      finishRequest(status, { error: message }, Math.round(performance.now() - started), 'Gateway')
    }

    // STEP 1: AUTHENTICATION
    await pause()

    const matchingRoute = routes.find(route =>
      route.path === endpoint &&
      route.method === method &&
      route.status === 'Active'
    )

    if (matchingRoute?.auth && token !== 'demo_token') {
      await fail(0, 401, 'Unauthorized: Invalid API token')
      return
    }

    completeStep(0, 'success')

    // STEP 2: RATE LIMITING
    await pause()

    const now = Date.now()

    if (now - rateRef.current.started >= 60000) {
      rateRef.current = { count: 0, started: now }
    }

    rateRef.current.count += 1

    if (rateRef.current.count > rateLimit) {
      await fail(1, 429, 'Too many requests. Rate limit exceeded.')
      return
    }

    completeStep(1, 'success')

    // STEP 3: ROUTE MATCHING
    await pause()

    if (!matchingRoute) {
      await fail(2, 404, 'Route not found for this method and endpoint')
      return
    }

    completeStep(2, 'success')

    // STEP 4: CACHE
    await pause()

    const cacheKey = `${method}:${endpoint}`
    const cached = method === 'GET' ? cacheRef.current.get(cacheKey) : null

    completeStep(3, 'success')

    if (cached) {
      await pause()
      completeStep(4, 'success')
      finishRequest(200, cached, Math.round(performance.now() - started), 'Cache', true)
      return
    }

    // STEP 5: BACKEND PROCESSING
    await pause()

    let data
    let status = 200

    if (endpoint === '/api/users' && method === 'GET') {
      data = users
    } else if (endpoint === '/api/users' && method === 'POST') {
      let body

      try {
        body = JSON.parse(requestBody)
      } catch {
        await fail(4, 400, 'Invalid JSON request body')
        return
      }

      if (!body.name || !body.email) {
        await fail(4, 400, 'Request body requires name and email')
        return
      }

      const newUser = {
        id: Date.now(),
        name: body.name,
        email: body.email,
        role: 'Developer'
      }

      setUsers(prev => [...prev, newUser])
      data = { message: 'User created successfully', user: newUser }
      status = 201
    } else if (endpoint === '/api/orders' && method === 'GET') {
      data = [
        { id: 501, product: 'Laptop Pro', total: 1299, status: 'Delivered' },
        { id: 502, product: 'Headphones', total: 199, status: 'Processing' },
        { id: 503, product: 'Keyboard', total: 149, status: 'Shipped' }
      ]
    } else if (endpoint === '/api/products' && method === 'GET') {
      data = products
    } else if (endpoint === '/api/health' && method === 'GET') {
      data = {
        status: 'healthy',
        uptime: '99.99%',
        gateway: 'operational',
        services: services.length
      }
    } else {
      data = {
        message: 'Simulated request processed successfully',
        endpoint,
        method
      }
    }

    const availableServices = services.filter(s => s.health === 'Healthy')
    const selectedServer = availableServices.length
      ? availableServices[roundRobinRef.current++ % availableServices.length].name
      : 'Gateway'

    if (method === 'GET') {
      cacheRef.current.set(cacheKey, data)
    } else {
      cacheRef.current.clear()
    }

    completeStep(4, 'success')

    finishRequest(
      status,
      data,
      Math.round(performance.now() - started),
      selectedServer
    )
  }

  const addRoute = () => {
    if (!routePath.startsWith('/api/')) {
      notify('Endpoint must start with /api/')
      return
    }

    if (routes.some(r => r.path === routePath && r.method === routeMethod)) {
      notify('This route already exists')
      return
    }

    setRoutes(prev => [...prev, {
      id: Date.now(),
      method: routeMethod,
      path: routePath,
      service: routeService,
      auth: true,
      status: 'Active'
    }])

    setNewRoute(false)
    notify('Route created successfully')
  }

  const toggleRoute = id => {
    setRoutes(prev => prev.map(r => r.id === id
      ? { ...r, status: r.status === 'Active' ? 'Disabled' : 'Active' }
      : r
    ))
    cacheRef.current.clear()
    notify('Route configuration updated')
  }

  const deleteRoute = id => {
    setRoutes(prev => prev.filter(r => r.id !== id))
    cacheRef.current.clear()
    notify('Route deleted')
  }

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response?.data, null, 2))
    notify('Response copied')
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.endpoint.toLowerCase().includes(search.toLowerCase()) ||
      log.method.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === 'All' ||
      (filter === 'Success' && log.status < 400) ||
      (filter === 'Errors' && log.status >= 400)

    return matchesSearch && matchesFilter
  })

  const renderDashboard = () => (
    <>
      <div className="welcome-row">
        <div>
          <h2>Good evening, Developer <span>✦</span></h2>
          <p>Here's what's happening with your API infrastructure today.</p>
        </div>
        <Badge>● All systems operational</Badge>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Requests" value={requestCount.toLocaleString()} change="12.8%" icon={Activity} color="#9275ff"/>
        <StatCard label="Success Rate" value="99.82%" change="2.4%" icon={ShieldCheck} color="#42d6a4"/>
        <StatCard label="Avg. Latency" value="42 ms" change="8.2%" icon={Clock3} color="#5daaff"/>
        <StatCard label="Error Requests" value={errorCount} change="3.1%" icon={AlertTriangle} color="#ff8d8d"/>
      </div>

      <div className="dashboard-grid">
        <div className="panel traffic-panel">
          <div className="panel-heading">
            <div>
              <h3>API Traffic Overview</h3>
              <p>Request volume over time</p>
            </div>
            <Badge type="purple">Last 9 hours</Badge>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9275ff" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="#9275ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#24293a" vertical={false}/>
                <XAxis dataKey="time" stroke="#737b91" axisLine={false} tickLine={false}/>
                <YAxis stroke="#737b91" axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background: '#151a29', border: '1px solid #30364a', borderRadius: 10 }}/>
                <Area type="monotone" dataKey="requests" stroke="#9275ff" strokeWidth={2.5} fill="url(#trafficGradient)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div><h3>Gateway Health</h3><p>Infrastructure overview</p></div>
            <Activity color="#42d6a4"/>
          </div>
          <div className="health-score">
            <div className="health-ring"><span>99.9<small>%</small></span></div>
            <h3>Excellent health</h3>
            <p>All simulated services are operational.</p>
          </div>
          {services.map(service => (
            <div className="health-row" key={service.name}>
              <span>{service.name}</span>
              <Badge>{service.health}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="panel table-panel">
        <div className="panel-heading">
          <div><h3>Recent API Requests</h3><p>Latest gateway activity</p></div>
          <button className="text-btn" onClick={() => setActivePage('Logs')}>View all <ArrowUpRight size={15}/></button>
        </div>
        <RequestTable logs={logs.slice(0, 5)}/>
      </div>
    </>
  )

  const renderPlayground = () => (
    <>
      <div className="page-intro">
        <h2>API Playground</h2>
        <p>Send requests and observe how your gateway processes them.</p>
      </div>

      <div className="playground-grid">
        <div className="panel request-panel">
          <div className="panel-heading">
            <div><h3><Terminal size={17}/> Request Builder</h3><p>Configure your API request</p></div>
            <Badge type="purple">SIMULATOR</Badge>
          </div>

          <label className="field-label">HTTP Method & Endpoint</label>
          <div className="request-line">
            <select value={method} onChange={e => setMethod(e.target.value)}>
              {['GET', 'POST', 'PUT', 'DELETE'].map(m => <option key={m}>{m}</option>)}
            </select>
            <input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="/api/users"/>
          </div>

          <label className="field-label">Authorization Token</label>
          <div className="input-icon">
            <LockKeyhole size={16}/>
            <input value={token} onChange={e => setToken(e.target.value)} placeholder="Enter API token"/>
          </div>
          <p className="hint">Demo token: <code>demo_token</code></p>

          <label className="field-label">Request Body (JSON)</label>
          <textarea
            className="code-input"
            value={requestBody}
            onChange={e => setRequestBody(e.target.value)}
            spellCheck="false"
          />

          <button className="primary-btn send-btn" onClick={runRequest} disabled={processing}>
            {processing ? <RefreshCw className="spin" size={17}/> : <Play size={16}/>}
            {processing ? 'Processing Request...' : 'Send Request'}
          </button>

          <div className="quick-endpoints">
            <label className="field-label">Quick Endpoints</label>
            {[
              ['GET', '/api/users'],
              ['POST', '/api/users'],
              ['GET', '/api/orders'],
              ['GET', '/api/products'],
              ['GET', '/api/health']
            ].map(([m, p]) => (
              <button key={m+p} onClick={() => { setMethod(m); setEndpoint(p) }}>
                <span className={`method ${m.toLowerCase()}`}>{m}</span>{p}
              </button>
            ))}
          </div>
        </div>

        <div className="right-playground">
          <div className="panel pipeline-panel">
            <div className="panel-heading">
              <div><h3>Processing Pipeline</h3><p>Live gateway execution</p></div>
              <Badge type={processing ? 'purple' : 'green'}>{processing ? 'PROCESSING' : 'READY'}</Badge>
            </div>
            {pipeline.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Zap size={25}/></div>
                <h3>Ready to process</h3>
                <p>Send a request to see each gateway processing stage.</p>
              </div>
            ) : pipeline.map((step, i) => {
              const Icon = step.icon
              return (
                <div className="pipeline-step" key={step.name}>
                  <div className={`pipeline-icon ${step.status}`}><Icon size={18}/></div>
                  <div className="pipeline-info">
                    <strong>{step.name}</strong>
                    <span>{step.detail}</span>
                  </div>
                  <div className="pipeline-status">
                    {step.status === 'success' && <Badge>Passed</Badge>}
                    {step.status === 'failed' && <Badge type="red">Failed</Badge>}
                    {step.status === 'running' && <RefreshCw size={15} className="spin"/>}
                    {step.status === 'pending' && <span className="muted">Waiting</span>}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="panel response-panel">
            <div className="panel-heading">
              <div><h3>Response Preview</h3><p>Gateway response output</p></div>
              {response && <button className="icon-btn" onClick={copyResponse}><Copy size={16}/></button>}
            </div>
            {!response ? (
              <div className="empty-state response-empty">
                <Code2 size={26}/>
                <p>Response will appear here after processing.</p>
              </div>
            ) : (
              <>
                <div className="response-meta">
                  <Badge type={response.status < 400 ? 'green' : 'red'}>{response.status} {response.status < 400 ? 'SUCCESS' : 'ERROR'}</Badge>
                  <span><Clock3 size={13}/> {response.latency} ms</span>
                  <span><Server size={13}/> {response.server}</span>
                  {response.cached && <Badge type="purple">CACHED</Badge>}
                </div>
                <pre className="response-json">{JSON.stringify(response.data, null, 2)}</pre>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )

  const renderRoutes = () => (
    <>
      <div className="page-intro page-action">
        <div><h2>API Routes</h2><p>Manage endpoint routing configurations.</p></div>
        <button className="primary-btn" onClick={() => setNewRoute(true)}><Plus size={16}/> Add Route</button>
      </div>

      <div className="stats-grid compact-stats">
        <StatCard label="Total Routes" value={routes.length} change="Registered" icon={RouteIcon} color="#9275ff"/>
        <StatCard label="Active Routes" value={routes.filter(r => r.status === 'Active').length} change="Operational" icon={Check} color="#42d6a4"/>
        <StatCard label="Disabled Routes" value={routes.filter(r => r.status !== 'Active').length} change="Inactive" icon={AlertTriangle} color="#ffb46b"/>
      </div>

      <div className="panel table-panel">
        <div className="panel-heading"><div><h3>Registered Endpoints</h3><p>Configure your API routing rules</p></div></div>
        <table>
          <thead><tr><th>METHOD</th><th>ENDPOINT</th><th>SERVICE</th><th>AUTH</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
          <tbody>
            {routes.map(route => (
              <tr key={route.id}>
                <td><span className={`method ${route.method.toLowerCase()}`}>{route.method}</span></td>
                <td><code>{route.path}</code></td>
                <td>{route.service}</td>
                <td>{route.auth ? <Badge type="purple">Protected</Badge> : <Badge>Public</Badge>}</td>
                <td><Badge type={route.status === 'Active' ? 'green' : 'red'}>{route.status}</Badge></td>
                <td>
                  <div className="action-group">
                    <button className="icon-btn" title="Enable / Disable" onClick={() => toggleRoute(route.id)}><RefreshCw size={15}/></button>
                    <button className="icon-btn danger-btn" title="Delete" onClick={() => deleteRoute(route.id)}><Trash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {newRoute && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-heading"><h3>Create API Route</h3><button className="icon-btn" onClick={() => setNewRoute(false)}><X/></button></div>
            <label className="field-label">HTTP Method</label>
            <select value={routeMethod} onChange={e => setRouteMethod(e.target.value)}>
              {['GET','POST','PUT','DELETE'].map(m => <option key={m}>{m}</option>)}
            </select>
            <label className="field-label">Endpoint Path</label>
            <input value={routePath} onChange={e => setRoutePath(e.target.value)}/>
            <label className="field-label">Backend Service</label>
            <select value={routeService} onChange={e => setRouteService(e.target.value)}>
              {services.map(s => <option key={s.name}>{s.name}</option>)}
            </select>
            <button className="primary-btn send-btn" onClick={addRoute}>Create Route</button>
          </div>
        </div>
      )}
    </>
  )

  const renderServices = () => (
    <>
      <div className="page-intro"><h2>Backend Services</h2><p>Monitor simulated backend service instances.</p></div>
      <div className="service-grid">
        {services.map((s, i) => (
          <div className="panel service-card" key={s.name}>
            <div className="service-top"><div className="service-icon"><Server/></div><Badge>{s.health}</Badge></div>
            <h3>{s.name}</h3>
            <p className="muted">{s.url}:{s.port}</p>
            <div className="service-metric"><span>Uptime</span><strong>{s.uptime}</strong></div>
            <div className="service-metric"><span>Instance</span><strong>node-0{i+1}</strong></div>
            <button className="secondary-btn" onClick={() => {
              setServices(prev => prev.map(x => x.name === s.name ? {...x, health: x.health === 'Healthy' ? 'Offline' : 'Healthy'} : x))
              notify('Service status updated')
            }}>Toggle Service Health</button>
          </div>
        ))}
      </div>
    </>
  )

  const renderConsumers = () => (
    <>
      <div className="page-intro"><h2>API Consumers</h2><p>Manage registered users and developer clients.</p></div>
      <div className="panel table-panel">
        <div className="panel-heading"><div><h3>Registered Consumers</h3><p>Demo consumer database</p></div><Badge>{users.length} Consumers</Badge></div>
        <table>
          <thead><tr><th>ID</th><th>NAME</th><th>EMAIL</th><th>ROLE</th><th>STATUS</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}><td>#{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td><Badge>Active</Badge></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )

  const renderLimits = () => (
    <>
      <div className="page-intro"><h2>Rate Limiting</h2><p>Configure how many requests the gateway accepts per minute.</p></div>
      <div className="panel limit-panel">
        <div className="limit-icon"><Gauge size={25}/></div>
        <h3>Global Request Limit</h3>
        <p>Maximum allowed requests per minute in this browser session.</p>
        <div className="limit-number">{rateLimit}<span> requests / minute</span></div>
        <input type="range" min="1" max="50" value={rateLimit} onChange={e => {
          setRateLimit(Number(e.target.value))
          rateRef.current = { count: 0, started: Date.now() }
        }}/>
        <div className="range-labels"><span>1 request</span><span>50 requests</span></div>
        <button className="primary-btn" onClick={() => {
          rateRef.current = { count: 0, started: Date.now() }
          notify('Rate counter reset')
        }}><RefreshCw size={15}/> Reset Request Counter</button>
        <div className="limit-info"><ShieldCheck size={17}/> Requests exceeding the configured limit receive HTTP 429.</div>
      </div>
    </>
  )

  const renderAnalytics = () => (
    <>
      <div className="page-intro"><h2>Analytics</h2><p>Analyze simulated API traffic and gateway performance.</p></div>
      <div className="stats-grid">
        <StatCard label="Total Requests" value={requestCount.toLocaleString()} change="12.8%" icon={Activity} color="#9275ff"/>
        <StatCard label="Success Rate" value="99.82%" change="2.4%" icon={Check} color="#42d6a4"/>
        <StatCard label="Avg. Response" value="42 ms" change="8.2%" icon={Clock3} color="#5daaff"/>
        <StatCard label="Failed Requests" value={errorCount} change="3.1%" icon={AlertTriangle} color="#ff8d8d"/>
      </div>
      <div className="panel traffic-panel">
        <div className="panel-heading"><div><h3>Request Distribution</h3><p>Illustrative traffic data</p></div></div>
        <div className="chart-wrap tall">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="#24293a" vertical={false}/>
              <XAxis dataKey="time" stroke="#737b91"/>
              <YAxis stroke="#737b91"/>
              <Tooltip contentStyle={{background:'#151a29',border:'1px solid #30364a'}}/>
              <Bar dataKey="requests" fill="#9275ff" radius={[5,5,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="hint">Note: The historical chart and baseline metrics are demonstration data. Request counts update when you use the playground.</p>
    </>
  )

  const renderLogs = () => (
    <>
      <div className="page-intro"><h2>Request Logs</h2><p>Inspect requests processed by your API gateway.</p></div>
      <div className="panel table-panel">
        <div className="log-toolbar">
          <div className="input-icon search-box"><Search size={16}/><input placeholder="Search endpoint..." value={search} onChange={e => setSearch(e.target.value)}/></div>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option>All</option><option>Success</option><option>Errors</option>
          </select>
          <button className="secondary-btn" onClick={() => setLogs([])}><Trash2 size={14}/> Clear Logs</button>
        </div>
        <RequestTable logs={filteredLogs}/>
        {logs.length === 0 && <div className="empty-state"><FileText size={25}/><p>No requests yet. Try the API Playground.</p></div>}
      </div>
    </>
  )

  const renderSettings = () => (
    <>
      <div className="page-intro"><h2>Settings</h2><p>Configure your gateway simulator.</p></div>
      <div className="panel settings-panel">
        <h3>Appearance</h3>
        <p>Choose your dashboard theme.</p>
        <div className="setting-row"><span>Dark interface</span><button className={`toggle ${theme === 'dark' ? 'on' : ''}`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><span/></button></div>
        <div className="divider"/>
        <h3>Simulation Configuration</h3>
        <div className="setting-row"><div><strong>Gateway authentication</strong><p>Demo token validation</p></div><Badge>Enabled</Badge></div>
        <div className="setting-row"><div><strong>Response caching</strong><p>In-memory GET response cache</p></div><Badge>Enabled</Badge></div>
        <div className="setting-row"><div><strong>Rate limiting</strong><p>Per-minute request counter</p></div><Badge>Enabled</Badge></div>
        <button className="secondary-btn" onClick={() => {
          setLogs([])
          setUsers(initialUsers)
          setRoutes(initialRoutes)
          setServices(initialServices)
          setRateLimit(5)
          setRequestCount(12849)
          setErrorCount(23)
          cacheRef.current.clear()
          rateRef.current = {count: 0, started: Date.now()}
          setResponse(null)
          setPipeline([])
          notify('Demo data has been reset')
        }}><RefreshCw size={15}/> Reset Demo Data</button>
      </div>
    </>
  )

  const pageContent = {
    Dashboard: renderDashboard,
    'API Playground': renderPlayground,
    Routes: renderRoutes,
    Services: renderServices,
    Consumers: renderConsumers,
    'Rate Limits': renderLimits,
    Analytics: renderAnalytics,
    Logs: renderLogs,
    Settings: renderSettings
  }

  return (
    <div className={`app-shell ${theme === 'light' ? 'light-theme' : ''}`}>
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)}/>}
      <aside className={`sidebar ${mobileOpen ? 'mobile-visible' : ''}`}>
        <div className="brand">
          <div className="brand-icon"><Zap size={22}/></div>
          <span>GATE<span className="brand-accent">FLOW</span></span>
          <button className="mobile-close" onClick={() => setMobileOpen(false)}><X/></button>
        </div>
        <div className="workspace">
          <div className="workspace-avatar">D</div>
          <div><strong>Developer Workspace</strong><span>Free plan</span></div>
          <ChevronDown size={15}/>
        </div>
        <nav>
          {navigation.map(group => (
            <div className="nav-group" key={group.title}>
              <div className="nav-label">{group.title}</div>
              {group.items.map(item => {
                const Icon = item.icon
                return (
                  <button key={item.name} className={`nav-item ${activePage === item.name ? 'active' : ''}`} onClick={() => {
                    setActivePage(item.name)
                    setMobileOpen(false)
                  }}>
                    <Icon size={18}/><span>{item.name}</span>
                    {item.name === 'API Playground' && <span className="nav-new">NEW</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><CircleHelp size={18}/><div><strong>Need help?</strong><span>Explore documentation</span></div></div>
          <div className="profile"><div className="profile-avatar">D</div><div><strong>Demo Developer</strong><span>Administrator</span></div><Settings size={17}/></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu/></button>
          <div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{activePage}</strong></div>
          <div className="topbar-right">
            <div className="environment"><span/> Development</div>
            <button className="icon-btn" title="Notifications"><Bell size={18}/></button>
            <div className="top-avatar">D</div>
          </div>
        </header>
        <div className="page-content">
          {(pageContent[activePage] || renderDashboard)()}
        </div>
        <footer className="footer">
          <span>GATEFLOW © 2026</span>
          <span>Frontend API Gateway Simulator <span className="footer-dot"/> All systems operational</span>
        </footer>
      </main>
      {toast && <div className="toast"><Check size={17}/>{toast}</div>}
    </div>
  )
}

function RequestTable({ logs }) {
  if (!logs.length) return <div className="empty-state"><Activity size={25}/><p>No request activity to display.</p></div>

  return (
    <div className="table-scroll">
      <table>
        <thead><tr><th>METHOD</th><th>ENDPOINT</th><th>STATUS</th><th>LATENCY</th><th>SERVER</th><th>TIME</th></tr></thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td><span className={`method ${log.method.toLowerCase()}`}>{log.method}</span></td>
              <td><code>{log.endpoint}</code></td>
              <td><Badge type={log.status < 400 ? 'green' : 'red'}>{log.status}</Badge></td>
              <td>{log.latency} ms</td>
              <td>{log.server}</td>
              <td>{log.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
