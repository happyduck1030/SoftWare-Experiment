// Minimal shadcn-style toast utility (imperative)
const TOAST_CONTAINER_ID = 'shadcn-toast-container'

function getContainer() {
  let c = document.getElementById(TOAST_CONTAINER_ID)
  if (!c) {
    c = document.createElement('div')
    c.id = TOAST_CONTAINER_ID
    // center top
    c.className = 'fixed left-1/2 top-4 z-50 transform -translate-x-1/2 flex flex-col gap-3 w-full max-w-md items-center px-4'
    document.body.appendChild(c)
  }
  return c
}

function show(message, { type = 'info', duration = 4000 } = {}) {
  const container = getContainer()
  const el = document.createElement('div')
  const bg = type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : type === 'warning' ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-white border-gray-200 text-gray-900'
  el.className = `shadcn-toast animate-slide-in px-4 py-3 rounded-xl border shadow-sm ${bg}`
  el.style.transition = 'opacity 200ms ease'
  el.innerText = message
  container.appendChild(el)

  const hide = () => {
    try { container.removeChild(el) } catch (e) {}
  }

  setTimeout(hide, duration)
  return { dismiss: hide }
}

export const toast = {
  success: (msg, opts) => show(msg, { type: 'success', ...(opts || {}) }),
  error: (msg, opts) => show(msg, { type: 'error', ...(opts || {}) }),
  warning: (msg, opts) => show(msg, { type: 'warning', ...(opts || {}) }),
  info: (msg, opts) => show(msg, { type: 'info', ...(opts || {}) })
}

// small slide-in animation style (inserted once)
if (typeof window !== 'undefined') {
  const id = 'shadcn-toast-styles'
  if (!document.getElementById(id)) {
    const style = document.createElement('style')
    style.id = id
    style.innerHTML = `
      @keyframes slideDown { from { transform: translateY(-8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      .animate-slide-in { animation: slideDown 200ms ease }
      .shadcn-toast { min-width: 0; width: 100%; max-width: 540px }
    `
    document.head.appendChild(style)
  }
}

export default toast
