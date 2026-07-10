// plugins/tj.client.ts

export default defineNuxtPlugin(() => {
  // 创建一个 script 标签
  const script = document.createElement('script')
  
  // 把 51LA 的代码作为文本内容注入
  script.textContent = `
    // ⬇️⬇️⬇️ 从这里开始，粘贴你从 51LA 复制的代码 ⬇️⬇️⬇️
    
    !function(p){"use strict";!function(t){var s=window,e=document,i=p,c="".concat("https:"===e.location.protocol?"https://":"http://","sdk.51.la/js-sdk-pro.min.js"),n=e.createElement("script"),r=e.getElementsByTagName("script")[0];n.type="text/javascript",n.setAttribute("charset","UTF-8"),n.async=!0,n.src=c,n.id="LA_COLLECT",i.d=n;var o=function(){s.LA.ids.push(i)};s.LA?s.LA.ids&&o():(s.LA=p,s.LA.ids=[],o()),r.parentNode.insertBefore(n,r)}()}({id:"3QWESqerv71jwMMn",ck:"3QWESqerv71jwMMn"});
    
    // ⬆️⬆️⬆️ 到这里结束 ⬆️⬆️⬆️
  `
  
  // 把 script 标签添加到页面头部
  document.head.appendChild(script)
})
