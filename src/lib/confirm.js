// Lightweight shadcn-style confirm dialog (imperative, returns Promise)
export default function confirm({ title = '确认', description = '', okText = '确定', cancelText = '取消' } = {}) {
  return new Promise((resolve) => {
    const wrapper = document.createElement('div')
    wrapper.className = 'fixed inset-0 z-50 flex items-center justify-center'
    wrapper.innerHTML = `
      <div class="fixed inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 z-10">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
          <p class="text-sm text-gray-500 mt-1">${description}</p>
        </div>
        <div class="flex gap-3 p-6 bg-gray-50 border-t border-gray-200 justify-end">
          <button data-action="cancel" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">${cancelText}</button>
          <button data-action="ok" class="px-4 py-2 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl">${okText}</button>
        </div>
      </div>
    `

    const onResolve = (val) => {
      document.body.removeChild(wrapper)
      resolve(val)
    }

    wrapper.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.getAttribute('data-action')
      if (action === 'ok') onResolve(true)
      if (action === 'cancel') onResolve(false)
    })

    // support Esc to cancel
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onResolve(false)
      }
    }
    document.addEventListener('keydown', onKey)

    // cleanup when resolved
    const origResolve = resolve
    resolve = (val) => {
      document.removeEventListener('keydown', onKey)
      origResolve(val)
    }

    document.body.appendChild(wrapper)
  })
}
