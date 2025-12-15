import React from 'react'

const Pixel404 = ({ reason }) => {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#0b132b] text-white p-6">
      <div className="max-w-lg w-full bg-[#0f172a] border-4 border-[#111827] rounded-3xl shadow-[8px_8px_0px_#05080f] p-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-14 h-14 bg-[#8b5cf6] border-4 border-[#111827] rounded-xl flex items-center justify-center text-3xl shadow-[4px_4px_0px_#05080f]">
            🧩
          </div>
          <div>
            <p className="text-sm text-white/70 uppercase tracking-widest">Pixel World</p>
            <h1 className="text-3xl font-black leading-tight">404 / Access Blocked</h1>
          </div>
        </div>

        <p className="text-white/80 text-sm leading-relaxed">
          {reason === 'forbidden'
            ? '当前页面仅限机构负责人访问，您似乎没有对应的权限。'
            : '你闯入了一片未知的像素星域，暂时还没有可以访问的内容。'}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {[...Array(9)].map((_, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-lg bg-white/10 border border-white/10 shadow-inner flex items-center justify-center text-xs text-white/50"
            >
              ✦
            </div>
          ))}
        </div>

        <a
          href="/employee"
          className="mt-6 inline-flex items-center justify-center px-4 py-3 bg-[#8b5cf6] border-4 border-[#111827] rounded-xl text-sm font-semibold shadow-[4px_4px_0px_#05080f] hover:-translate-y-0.5 transition-transform"
        >
          返回员工主页
        </a>
      </div>
    </div>
  )
}

export default Pixel404

