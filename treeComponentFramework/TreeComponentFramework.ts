//onsave jtree build produce TreeComponentFramework.browser.js

import { treeNotationTypes } from "../products/treeNotationTypes"

const { jtree } = require("../index.js")
const stumpNode = require("../langs/stump/stump.node.js")
const hakonNode = require("../langs/hakon/hakon.node.js")

declare var jQuery: any

const WillowConstants: treeNotationTypes.stringMap = {}
WillowConstants.ShadowEvents = {}
WillowConstants.ShadowEvents.click = "click"
WillowConstants.ShadowEvents.change = "change"
WillowConstants.ShadowEvents.mouseover = "mouseover"
WillowConstants.ShadowEvents.mouseout = "mouseout"
WillowConstants.ShadowEvents.mousedown = "mousedown"
WillowConstants.ShadowEvents.contextmenu = "contextmenu"
WillowConstants.ShadowEvents.keypress = "keypress"
WillowConstants.ShadowEvents.keyup = "keyup"
WillowConstants.ShadowEvents.focus = "focus"
WillowConstants.ShadowEvents.mousemove = "mousemove"
WillowConstants.ShadowEvents.dblclick = "dblclick"
WillowConstants.ShadowEvents.submit = "submit"
WillowConstants.ShadowEvents.blur = "blur"
WillowConstants.ShadowEvents.paste = "paste"
WillowConstants.ShadowEvents.copy = "copy"
WillowConstants.ShadowEvents.resize = "resize"
WillowConstants.ShadowEvents.cut = "cut"
WillowConstants.ShadowEvents.drop = "drop"
WillowConstants.ShadowEvents.dragover = "dragover"
WillowConstants.ShadowEvents.dragenter = "dragenter"
WillowConstants.ShadowEvents.dragleave = "dragleave"
WillowConstants.ShadowEvents.ready = "ready"

// todo: cleanup
WillowConstants.DataShadowEvents = {}
WillowConstants.DataShadowEvents.onClickCommand = "stumpOnClickCommand"
WillowConstants.DataShadowEvents.onShiftClickCommand = "stumpOnShiftClickCommand"
WillowConstants.DataShadowEvents.onBlurCommand = "stumpOnBlurCommand"
WillowConstants.DataShadowEvents.onContextMenuCommand = "stumpOnContextMenuCommand"
WillowConstants.DataShadowEvents.onChangeCommand = "stumpOnChangeCommand"
WillowConstants.DataShadowEvents.onDblClickCommand = "stumpOnDblClickCommand"

// todo: cleanup
WillowConstants.titleTag = "titleTag"
WillowConstants.styleTag = "styleTag"
WillowConstants.tagMap = {}
WillowConstants.tagMap[WillowConstants.styleTag] = "style"
WillowConstants.tagMap[WillowConstants.titleTag] = "title"
WillowConstants.tags = {}
WillowConstants.tags.html = "html"
WillowConstants.tags.head = "head"
WillowConstants.tags.body = "body"
WillowConstants.stumpCollapseNode = "stumpCollapseNode"
WillowConstants.uidAttribute = "stumpUid"
WillowConstants.class = "class"
WillowConstants.type = "type"
WillowConstants.value = "value"
WillowConstants.name = "name"
WillowConstants.checkbox = "checkbox"
WillowConstants.checkedSelector = ":checked"
WillowConstants.contenteditable = "contenteditable"
WillowConstants.inputTypes = ["input", "textarea"]

enum CacheType {
  inBrowserMemory = "inBrowserMemory"
}

class WillowHTTPResponse {
  constructor(superAgentResponse?: any) {
    this._superAgentResponse = superAgentResponse
    this._mimeType = superAgentResponse && superAgentResponse.type
  }

  private _superAgentResponse: any
  private _mimeType: any
  protected _cacheType = CacheType.inBrowserMemory
  private _fromCache = false
  protected _text: string
  protected _cacheTime = Date.now()
  protected _proxyServerResponse: any

  // todo: ServerMemoryCacheTime and ServerMemoryDiskCacheTime
  get cacheTime() {
    return this._cacheTime
  }

  get cacheType() {
    return this._cacheType
  }

  get body() {
    return this._superAgentResponse && this._superAgentResponse.body
  }

  get text() {
    if (this._text === undefined) this._text = this._superAgentResponse && this._superAgentResponse.text ? this._superAgentResponse.text : this.body ? JSON.stringify(this.body, null, 2) : ""
    return this._text
  }

  get asJson() {
    return this.body ? this.body : JSON.parse(this.text)
  }

  get fromCache() {
    return this._fromCache
  }

  setFromCache(val: any) {
    this._fromCache = val
    return this
  }

  getParsedDataOrText() {
    if (this._mimeType === "text/csv") return this.text
    return this.body || this.text
  }
}

class WillowHTTPProxyCacheResponse extends WillowHTTPResponse {
  constructor(proxyServerResponse: any) {
    super()
    this._proxyServerResponse = proxyServerResponse
    this._cacheType = proxyServerResponse.body.cacheType
    this._cacheTime = proxyServerResponse.body.cacheTime
    this._text = proxyServerResponse.body.text
  }
}

class AbstractWillowShadow {
  constructor(stumpNode: any) {
    this._stumpNode = stumpNode
  }

  private _stumpNode: any // todo: add stump type
  private _val: string

  getShadowStumpNode() {
    return this._stumpNode
  }

  getShadowValue() {
    return this._val
  }

  removeShadow() {
    return this
  }

  setInputOrTextAreaValue(value: string) {
    this._val = value
    return this
  }

  getShadowParent() {
    return this.getShadowStumpNode()
      .getParent()
      .getShadow()
  }

  getPositionAndDimensions(gridSize = 1) {
    const offset = this.getShadowOffset()
    const parentOffset = this.getShadowParent().getShadowOffset()
    return {
      left: Math.floor((offset.left - parentOffset.left) / gridSize),
      top: Math.floor((offset.top - parentOffset.top) / gridSize),
      width: Math.floor(this.getShadowWidth() / gridSize),
      height: Math.floor(this.getShadowHeight() / gridSize)
    }
  }

  shadowHasClass(name: string) {
    return false
  }

  getShadowAttr(name: string) {
    return ""
  }

  makeResizable(options: any) {
    return this
  }
  makeDraggable(options: any) {
    return this
  }
  makeSelectable(options: any) {
    return this
  }

  isShadowChecked() {
    return false
  }

  getShadowHtml() {
    return ""
  }

  getShadowOffset() {
    return { left: 111, top: 111 }
  }

  getShadowWidth() {
    return 111
  }

  getShadowHeight() {
    return 111
  }

  isShadowResizable() {
    return false
  }

  setShadowAttr(name: string, value: any) {
    return this
  }

  isShadowDraggable() {
    return this.shadowHasClass("draggable")
  }

  toggleShadow() {}

  addClassToShadow(className: string) {}

  removeClassFromShadow(className: string) {
    return this
  }

  onShadowEvent(event: any, selector?: any, fn?: any) {
    // todo:
    return this
  }

  offShadowEvent(event: any, fn: any) {
    // todo:
    return this
  }

  triggerShadowEvent(name: string) {
    return this
  }

  getShadowPosition() {
    return {
      left: 111,
      top: 111
    }
  }

  getShadowOuterHeight() {
    return 11
  }

  getShadowOuterWidth() {
    return 11
  }

  getShadowCss(property: string) {
    return ""
  }

  setShadowCss(css: any) {
    return this
  }

  insertHtmlNode(childNode: any, index?: number) {}

  getShadowElement() {}
}

class WillowShadow extends AbstractWillowShadow {}

class WillowStore {
  constructor() {
    this._values = {}
  }
  private _values: treeNotationTypes.stringMap

  get(key: string) {
    return this._values[key]
  }
  set(key: string, value: any) {
    this._values[key] = value
    return this
  }
  remove(key: string) {
    delete this._values[key]
  }
  each(fn: any) {
    Object.keys(this._values).forEach(key => {
      fn(this._values[key], key)
    })
  }
  clearAll() {
    this._values = {}
  }
}

class WillowMousetrap {
  constructor() {
    this.prototype = {}
  }
  private prototype: treeNotationTypes.stringMap
  bind() {}
}

// this one should have no document, window, $, et cetera.
class AbstractWillowProgram extends stumpNode {
  constructor(baseUrl: string) {
    super(`${WillowConstants.tags.html}
 ${WillowConstants.tags.head}
 ${WillowConstants.tags.body}`)
    this._htmlStumpNode = this.nodeAt(0)
    this._headStumpNode = this.nodeAt(0).nodeAt(0)
    this._bodyStumpNode = this.nodeAt(0).nodeAt(1)
    this.addSuidsToHtmlHeadAndBodyShadows()
    const baseUrlWithoutTrailingPath = baseUrl.replace(/\/[^\/]*$/, "/")
    this._baseUrl = baseUrlWithoutTrailingPath
    const url = new URL(baseUrl)
    this.location.port = url.port
    this.location.protocol = url.protocol
    this.location.hostname = url.hostname
    this.location.host = url.host
  }

  private _htmlStumpNode: any
  private _headStumpNode: any
  private _bodyStumpNode: any
  protected _offlineMode = false
  private _baseUrl: string
  private _httpGetResponseCache: any = {}
  public location: any = {}
  private _mousetrap: any
  private _store: any

  _getPort() {
    return this.location.port ? ":" + this.location.port : ""
  }

  queryObjectToQueryString(obj: Object) {
    return ""
  }

  toPrettyDeepLink(treeCode: string, queryObject: any) {
    // todo: move things to a constant.
    const yi = "~"
    const xi = "_"
    const obj = Object.assign({}, queryObject)

    if (!treeCode.includes(yi) && !treeCode.includes(xi)) {
      obj.yi = yi
      obj.xi = xi
      obj.data = encodeURIComponent(treeCode.replace(/ /g, xi).replace(/\n/g, yi))
    } else obj.data = encodeURIComponent(treeCode)

    return this.getBaseUrl() + "?" + this.queryObjectToQueryString(obj)
  }

  getHost() {
    return this.location.host
  }

  reload() {}

  toggleOfflineMode() {
    this._offlineMode = !this._offlineMode
  }

  addSuidsToHtmlHeadAndBodyShadows() {}

  getShadowClass() {
    return WillowShadow
  }

  getMockMouseEvent() {
    return {
      clientX: 0,
      clientY: 0,
      offsetX: 0,
      offsetY: 0
    }
  }

  toggleFullScreen() {}

  getMousetrap() {
    if (!this._mousetrap) this._mousetrap = new WillowMousetrap()
    return this._mousetrap
  }

  _getFocusedShadow() {
    return this._focusedShadow || this.getBodyStumpNode().getShadow()
  }

  getHeadStumpNode() {
    return this._headStumpNode
  }

  getBodyStumpNode() {
    return this._bodyStumpNode
  }

  getHtmlStumpNode() {
    return this._htmlStumpNode
  }

  getStore() {
    if (!this._store) this._store = new WillowStore()
    return this._store
  }

  someInputHasFocus() {
    const focusedShadow = this._getFocusedShadow()
    if (!focusedShadow) return false
    const stumpNode = focusedShadow.getShadowStumpNode()
    return stumpNode && stumpNode.isInputType()
  }

  copyTextToClipboard(text: string) {}

  setCopyData(evt: any, str: string) {}

  getBaseUrl() {
    return this._baseUrl
  }

  _makeRelativeUrlAbsolute(url: string) {
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    return this.getBaseUrl() + url
  }

  async makeUrlAbsoluteAndHttpGetUrl(url: string, queryStringObject: Object, responseClass = WillowHTTPResponse) {
    return this.httpGetUrl(this._makeRelativeUrlAbsolute(url), queryStringObject, responseClass)
  }

  async httpGetUrl(url: string, queryStringObject: Object, responseClass = WillowHTTPResponse) {
    if (this._offlineMode) return new WillowHTTPResponse()

    const superagent = this.require("superagent")
    const superAgentResponse = await superagent
      .get(url)
      .query(queryStringObject)
      .set(this._headers || {})

    return new responseClass(superAgentResponse)
  }

  _getFromResponseCache(cacheKey: any) {
    const hit = this._httpGetResponseCache[cacheKey]
    if (hit) hit.setFromCache(true)
    return hit
  }

  _setInResponseCache(url: string, res: any) {
    this._httpGetResponseCache[url] = res
    return this
  }

  async httpGetUrlFromCache(url: string, queryStringMap: treeNotationTypes.queryStringMap = {}, responseClass = WillowHTTPResponse) {
    const cacheKey = url + JSON.stringify(queryStringMap)
    const cacheHit = this._getFromResponseCache(cacheKey)
    if (!cacheHit) {
      const res = await this.httpGetUrl(url, queryStringMap, responseClass)
      this._setInResponseCache(cacheKey, res)
      return res
    }
    return cacheHit
  }

  async httpGetUrlFromProxyCache(url: string) {
    if (!this.isDesktopVersion()) return this.httpGetUrlFromCache(url)
    const queryStringMap: treeNotationTypes.queryStringMap = {}
    queryStringMap.url = url
    queryStringMap.cacheOnServer = "true"
    return await this.httpGetUrlFromCache("/proxy", queryStringMap, WillowHTTPProxyCacheResponse)
  }

  async httpPostUrl(url: string, data: any) {
    if (this._offlineMode) return new WillowHTTPResponse()

    const superagent = this.require("superagent")
    const superAgentResponse = await superagent
      .post(this._makeRelativeUrlAbsolute(url))
      .set(this._headers || {})
      .send(data)

    return new WillowHTTPResponse(superAgentResponse)
  }

  encodeURIComponent(str: string) {
    return encodeURIComponent(str)
  }

  downloadFile(data: any, filename: string, filetype: string) {
    // noop
  }

  async appendScript(url: string) {}

  getWindowTitle() {
    // todo: deep getNodeByBase/withBase/type/word or something?
    const nodes = this.getTopDownArray()
    const titleNode = nodes.find((node: treeNotationTypes.treeNode) => node.getFirstWord() === WillowConstants.titleTag)
    return titleNode ? titleNode.getContent() : ""
  }

  setWindowTitle(value: string) {
    const nodes = this.getTopDownArray()
    const headNode = nodes.find((node: treeNotationTypes.treeNode) => node.getFirstWord() === WillowConstants.tags.head)
    headNode.touchNode(WillowConstants.titleTag).setContent(value)
    return this
  }

  _getHostname() {
    return this.location.hostname || ""
  }

  openUrl(link: string) {
    // noop in willow
  }

  getPageHtml() {
    return this.getHtmlStumpNode().toHtmlWithSuids()
  }

  getStumpNodeFromElement(el: any) {}

  setPasteHandler(fn: Function) {
    return this
  }

  setErrorHandler(fn: Function) {
    return this
  }

  setCopyHandler(fn: Function) {
    return this
  }

  setCutHandler(fn: Function) {
    return this
  }

  setResizeEndHandler(fn: Function) {
    return this
  }

  async confirmThen(message: string) {
    return true
  }

  async promptThen(message: string, value: any) {
    return value
  }

  // todo: refactor. should be able to override this.
  isDesktopVersion() {
    return this._getHostname() === "localhost"
  }

  setLoadedDroppedFileHandler(callback: Function, helpText = "") {}

  getWindowSize() {
    return {
      width: 1111,
      height: 1111
    }
  }

  getDocumentSize() {
    return this.getWindowSize()
  }

  isExternalLink(link: string) {
    if (link && link.substr(0, 1) === "/") return false
    if (!link.includes("//")) return false

    const hostname = this._getHostname()

    const url = new URL(link)
    return url.hostname && hostname !== url.hostname
  }

  forceRepaint() {}

  blurFocusedInput() {}
}

class WillowProgram extends AbstractWillowProgram {
  constructor(baseUrl: string) {
    super(baseUrl)
    this._offlineMode = true
  }
}

class WillowBrowserShadow extends AbstractWillowShadow {
  static _shadowUpdateNumber = 0 // todo: what is this for, debugging perf?
  _getJQElement() {
    // todo: speedup?
    if (!this._cachedEl) this._cachedEl = jQuery(`[${WillowConstants.uidAttribute}="${this.getShadowStumpNode()._getUid()}"]`)
    return this._cachedEl
  }

  private _cachedEl: any // todo: add typings.

  getShadowElement() {
    return this._getJQElement()[0]
  }

  getShadowPosition() {
    return this._getJQElement().position()
  }

  shadowHasClass(name: string) {
    return this._getJQElement().hasClass(name)
  }

  getShadowHtml() {
    return this._getJQElement().html()
  }

  getShadowValue() {
    // todo: cleanup, add tests
    if (this.getShadowStumpNode().isInputType()) return this._getJQElement().val()
    return this._getJQElement().val() || this.getShadowValueFromAttr()
  }

  getShadowValueFromAttr() {
    return this._getJQElement().attr(WillowConstants.value)
  }

  getShadowOuterHeight() {
    return this._getJQElement().outerHeight()
  }

  getShadowOuterWidth() {
    return this._getJQElement().outerWidth()
  }

  isShadowChecked() {
    return this._getJQElement().is(WillowConstants.checkedSelector)
  }

  getShadowWidth() {
    return this._getJQElement().width()
  }

  getShadowHeight() {
    return this._getJQElement().height()
  }

  getShadowOffset() {
    return this._getJQElement().offset()
  }

  getShadowAttr(name: string) {
    return this._getJQElement().attr(name)
  }

  _logMessage(type: string) {
    if (true) return true
    WillowBrowserShadow._shadowUpdateNumber++
    console.log(`DOM Update ${WillowBrowserShadow._shadowUpdateNumber}: ${type}`)
  }

  getShadowCss(prop: string) {
    return this._getJQElement().css(prop)
  }

  isShadowResizable() {
    return this._getJQElement().find(".ui-resizable-handle").length > 0
  }

  triggerShadowEvent(event: string) {
    this._getJQElement().trigger(event)
    this._logMessage("trigger")
    return this
  }

  // BEGIN MUTABLE METHODS:

  // todo: add tests
  // todo: idea, don't "paint" wall (dont append it to parent, until done.)
  insertHtmlNode(childStumpNode: any, index: number) {
    const newChildJqElement = jQuery(childStumpNode.toHtmlWithSuids())
    newChildJqElement.data("stumpNode", childStumpNode) // todo: what do we use this for?

    const jqEl = this._getJQElement()

    // todo: can we virtualize this?
    // would it be a "virtual shadow?"
    if (index === undefined) jqEl.append(newChildJqElement)
    else if (index === 0) jqEl.prepend(newChildJqElement)
    else jQuery(jqEl.children().get(index - 1)).after(newChildJqElement)

    this._logMessage("insert")
  }

  addClassToShadow(className: string) {
    this._getJQElement().addClass(className)
    this._logMessage("addClass")
    return this
  }

  removeClassFromShadow(className: string) {
    this._getJQElement().removeClass(className)
    this._logMessage("removeClass")
    return this
  }

  onShadowEvent(event: string, two: any, three: any) {
    this._getJQElement().on(event, two, three)
    this._logMessage("bind on")
    return this
  }

  offShadowEvent(event: string, fn: Function) {
    this._getJQElement().off(event, fn)
    this._logMessage("bind off")
    return this
  }

  toggleShadow() {
    this._getJQElement().toggle()
    this._logMessage("toggle")
    return this
  }

  makeResizable(options: any) {
    this._getJQElement().resizable(options)
    this._logMessage("resizable")
    return this
  }

  removeShadow() {
    this._getJQElement().remove()
    this._logMessage("remove")
    return this
  }

  setInputOrTextAreaValue(value: string) {
    this._getJQElement().val(value)
    this._logMessage("val")
    return this
  }

  setShadowAttr(name: string, value: string) {
    this._getJQElement().attr(name, value)
    this._logMessage("attr")
    return this
  }

  makeDraggable(options: any) {
    this._logMessage("draggable")
    this._getJQElement().draggable(options)
    return this
  }

  setShadowCss(css: Object) {
    this._getJQElement().css(css)
    this._logMessage("css")
    return this
  }

  makeSelectable(options: any) {
    this._getJQElement().selectable(options)
    this._logMessage("selectable")
    return this
  }
}

// same thing, except with side effects.
class WillowBrowserProgram extends AbstractWillowProgram {
  findStumpNodesByShadowClass(className: string) {
    const stumpNodes: any[] = []
    const that = this
    jQuery("." + className).each(function() {
      stumpNodes.push(that.getStumpNodeFromElement(this))
    })
    return stumpNodes
  }

  queryObjectToQueryString(obj: any) {
    return jQuery.param(obj)
  }

  addSuidsToHtmlHeadAndBodyShadows() {
    jQuery(WillowConstants.tags.html).attr(WillowConstants.uidAttribute, this.getHtmlStumpNode()._getUid())
    jQuery(WillowConstants.tags.head).attr(WillowConstants.uidAttribute, this.getHeadStumpNode()._getUid())
    jQuery(WillowConstants.tags.body).attr(WillowConstants.uidAttribute, this.getBodyStumpNode()._getUid())
  }

  getShadowClass() {
    return WillowBrowserShadow
  }

  setCopyHandler(fn: Function) {
    jQuery(document).on(WillowConstants.ShadowEvents.copy, fn)
    return this
  }

  setCutHandler(fn: Function) {
    jQuery(document).on(WillowConstants.ShadowEvents.cut, fn)
    return this
  }

  setPasteHandler(fn: any) {
    window.addEventListener(WillowConstants.ShadowEvents.paste, fn, false)
    return this
  }

  setErrorHandler(fn: any) {
    window.addEventListener("error", fn)
    window.addEventListener("unhandledrejection", fn)
    return this
  }

  toggleFullScreen() {
    const doc = <any>document
    if ((doc.fullScreenElement && doc.fullScreenElement !== null) || (!doc.mozFullScreen && !doc.webkitIsFullScreen)) {
      if (doc.documentElement.requestFullScreen) doc.documentElement.requestFullScreen()
      else if (doc.documentElement.mozRequestFullScreen) doc.documentElement.mozRequestFullScreen()
      else if (doc.documentElement.webkitRequestFullScreen) doc.documentElement.webkitRequestFullScreen((<any>Element).ALLOW_KEYBOARD_INPUT)
    } else {
      if (doc.cancelFullScreen) doc.cancelFullScreen()
      else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen()
      else if (doc.webkitCancelFullScreen) doc.webkitCancelFullScreen()
    }
  }

  setCopyData(evt: any, str: string) {
    const originalEvent = evt.originalEvent
    originalEvent.preventDefault()
    originalEvent.clipboardData.setData("text/plain", str)
    originalEvent.clipboardData.setData("text/html", str)
  }

  getMousetrap() {
    return (<any>window).Mousetrap
  }

  copyTextToClipboard(text: string) {
    // http://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    const textArea = document.createElement("textarea")
    textArea.style.position = "fixed"
    textArea.style.top = "0"
    textArea.style.left = "0"
    textArea.style.width = "2em"
    textArea.style.height = "2em"
    textArea.style.padding = "0"
    textArea.style.border = "none"
    textArea.style.outline = "none"
    textArea.style.boxShadow = "none"
    textArea.style.background = "transparent"
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      const successful = document.execCommand("copy")
    } catch (err) {}
    document.body.removeChild(textArea)
  }

  getStore() {
    return (<any>window).store
  }

  getHost() {
    return location.host
  }

  _getHostname() {
    return location.hostname
  }

  private _loadingPromises: any

  async appendScript(url: string) {
    if (!url) return undefined
    if (!this._loadingPromises) this._loadingPromises = {}
    if (this._loadingPromises[url]) return this._loadingPromises[url]

    if (this.isNodeJs()) return undefined

    this._loadingPromises[url] = this._appendScript(url)
    return this._loadingPromises[url]
  }

  _appendScript(url: string) {
    //https://bradb.net/blog/promise-based-js-script-loader/
    return new Promise(function(resolve, reject) {
      let resolved = false
      const scriptEl = document.createElement("script")

      scriptEl.type = "text/javascript"
      scriptEl.src = url
      scriptEl.async = true
      scriptEl.onload = (<any>scriptEl).onreadystatechange = function() {
        if (!resolved && (!this.readyState || this.readyState == "complete")) {
          resolved = true
          resolve(this)
        }
      }
      scriptEl.onerror = scriptEl.onabort = reject
      document.head.appendChild(scriptEl)
    })
  }

  downloadFile(data: any, filename: string, filetype: string) {
    const downloadLink = document.createElement("a")
    downloadLink.setAttribute("href", `data:${filetype},` + encodeURIComponent(data))
    downloadLink.setAttribute("download", filename)
    downloadLink.click()
  }

  reload() {
    window.location.reload()
  }

  openUrl(link: string) {
    window.open(link)
  }

  setResizeEndHandler(fn: Function) {
    let resizeTimer: any
    jQuery(window).on(WillowConstants.ShadowEvents.resize, (evt: any) => {
      const target = jQuery(evt.target)
      if (target.is("div")) return // dont resize on div resizes
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        fn({ width: target.width(), height: target.height() })
      }, 100)
    })
    return this
  }

  getStumpNodeFromElement(el: any) {
    const jqEl: any = jQuery(el)
    return this.getHtmlStumpNode().getNodeByGuid(parseInt(jqEl.attr(WillowConstants.uidAttribute)))
  }

  forceRepaint() {
    jQuery(window).width()
  }

  getBrowserHtml() {
    return document.documentElement.outerHTML
  }

  async confirmThen(message: string) {
    return confirm(message)
  }

  async promptThen(message: string, value: any) {
    return prompt(message, value)
  }

  getWindowSize() {
    const windowStumpNode = jQuery(window)
    return {
      width: windowStumpNode.width(),
      height: windowStumpNode.height()
    }
  }

  getDocumentSize() {
    const documentStumpNode = jQuery(document)
    return {
      width: documentStumpNode.width(),
      height: documentStumpNode.height()
    }
  }

  // todo: denote the side effect
  blurFocusedInput() {
    // todo: test against browser.
    ;(<any>document.activeElement).blur()
  }

  setLoadedDroppedFileHandler(callback: Function, helpText = "") {
    const bodyStumpNode = this.getBodyStumpNode()
    const bodyShadow = bodyStumpNode.getShadow()

    // Added the below to ensure dragging from the chrome downloads bar works
    // http://stackoverflow.com/questions/19526430/drag-and-drop-file-uploads-from-chrome-downloads-bar
    const handleChromeBug = (event: any) => {
      const originalEvent = event.originalEvent
      const effect = originalEvent.dataTransfer.effectAllowed
      originalEvent.dataTransfer.dropEffect = effect === "move" || effect === "linkMove" ? "move" : "copy"
    }

    const dragoverHandler = (event: any) => {
      handleChromeBug(event)

      event.preventDefault()
      event.stopPropagation()
      if (!bodyStumpNode.stumpNodeHasClass("dragOver")) {
        bodyStumpNode.insertChildNode(`div ${helpText}
 id dragOverHelp`)
        bodyStumpNode.addClassToStumpNode("dragOver")
        // Add the help, and then hopefull we'll get a dragover event on the dragOverHelp, then
        // 50ms later, add the dragleave handler, and from now on drag leave will only happen on the help
        // div
        setTimeout(function() {
          bodyShadow.onShadowEvent(WillowConstants.ShadowEvents.dragleave, dragleaveHandler)
        }, 50)
      }
    }

    const dragleaveHandler = (event: any) => {
      event.preventDefault()
      event.stopPropagation()
      bodyStumpNode.removeClassFromStumpNode("dragOver")
      bodyStumpNode.findStumpNodeByChild("id dragOverHelp").removeStumpNode()
      bodyShadow.offShadowEvent(WillowConstants.ShadowEvents.dragleave, dragleaveHandler)
    }

    const dropHandler = async (event: any) => {
      event.preventDefault()
      event.stopPropagation()
      bodyStumpNode.removeClassFromStumpNode("dragOver")
      bodyStumpNode.findStumpNodeByChild("id dragOverHelp").removeStumpNode()

      const droppedItems = event.originalEvent.dataTransfer.items
      // NOTE: YOU NEED TO STAY IN THE "DROP" EVENT, OTHERWISE THE DATATRANSFERITEMS MUTATE
      // (BY DESIGN) https://bugs.chromium.org/p/chromium/issues/detail?id=137231
      // DO NOT ADD AN AWAIT IN THIS LOOP. IT WILL BREAK.
      const items = []
      for (let droppedItem of droppedItems) {
        const entry = droppedItem.webkitGetAsEntry()
        items.push(this._handleDroppedEntry(entry))
      }
      const results = await Promise.all(items)
      callback(results)
    }

    bodyShadow.onShadowEvent(WillowConstants.ShadowEvents.dragover, dragoverHandler)
    bodyShadow.onShadowEvent(WillowConstants.ShadowEvents.drop, dropHandler)

    // todo: why do we do this?
    bodyShadow.onShadowEvent(WillowConstants.ShadowEvents.dragenter, function(event: any) {
      event.preventDefault()
      event.stopPropagation()
    })
  }

  _handleDroppedEntry(item: any, path = "") {
    // http://stackoverflow.com/questions/3590058/does-html5-allow-drag-drop-upload-of-folders-or-a-folder-tree
    // http://stackoverflow.com/questions/6756583/prevent-browser-from-loading-a-drag-and-dropped-file
    return item.isFile ? this._handleDroppedFile(item) : this._handleDroppedDirectory(item, path)
  }

  _handleDroppedDirectory(item: any, path: any) {
    return new Promise((resolve, reject) => {
      item.createReader().readEntries(async (entries: any) => {
        const promises = []
        for (let i = 0; i < entries.length; i++) {
          promises.push(this._handleDroppedEntry(entries[i], path + item.name + "/"))
        }
        const res = await Promise.all(promises)
        resolve(res)
      })
    })
  }

  _handleDroppedFile(file: any) {
    // https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
    // http://www.sitepoint.com/html5-javascript-open-dropped-files/
    return new Promise((resolve, reject) => {
      file.file((data: any) => {
        const reader = new FileReader()
        reader.onload = evt => {
          resolve({ data: (<any>evt.target).result, filename: data.name })
        }
        reader.onerror = err => reject(err)
        reader.readAsText(data)
      })
    })
  }

  _getFocusedShadow() {
    const stumpNode = this.getStumpNodeFromElement(document.activeElement)
    return stumpNode && stumpNode.getShadow()
  }
}

abstract class AbstractCommander {
  private _target: any
  constructor(target: AbstractTreeComponent) {
    this._target = target
  }

  private _app: AbstractTreeComponentRootNode

  getTarget() {
    return this._target
  }

  toggleTreeComponentFrameworkDebuggerCommand() {
    // todo: cleanup
    const node = this._app.getNode("TreeComponentFrameworkDebuggerComponent")
    if (node) {
      node.unmountAndDestroy()
    } else {
      this._app.appendLine("TreeComponentFrameworkDebuggerComponent")
      this._app.renderAndGetRenderResult()
    }
  }
}

abstract class AbstractTheme {
  hakonToCss(str: string) {
    const hakonProgram = new hakonNode(str)
    // console.log(hakonProgram.getAllErrors())
    return hakonProgram.compile()
  }
}

class DefaultTheme extends AbstractTheme {}

// todo: cleanup
interface reasonForUpdatingOrNot {
  shouldUpdate: boolean
  reason: string
  staleTime?: number
  dependency?: AbstractTreeComponent
  lastRenderedTime?: number
  mTime?: number
}

interface childShouldUpdateResult {
  child: AbstractTreeComponent
  childUpdateBecause: reasonForUpdatingOrNot
}

/** Declaration file generated by dts-gen */
// Todo: clean up declaration file generation
declare class abstractHtmlTag extends jtree.GrammarBackedNonRootNode {
  constructor(...args: any[])
  addClassToStumpNode(...args: any[]): void
  findStumpNodeByChild(...args: any[]): void
  findStumpNodeByChildString(...args: any[]): void
  findStumpNodeByFirstWord(...args: any[]): void
  findStumpNodesByChild(...args: any[]): void
  findStumpNodesWithClass(...args: any[]): void
  getNodeByGuid(...args: any[]): void
  getShadow(...args: any[]): void
  getShadowClass(...args: any[]): void
  getStumpNodeAttr(...args: any[]): void
  getStumpNodeTreeComponent(...args: any[]): void
  getStumpNodeCss(...args: any[]): void
  getTag(...args: any[]): void
  insertChildNode(...args: any[]): abstractHtmlTag
  insertCssChildNode(...args: any[]): abstractHtmlTag
  isInputType(...args: any[]): void
  isStumpNodeCheckbox(...args: any[]): void
  removeClassFromStumpNode(...args: any[]): void
  removeCssStumpNode(...args: any[]): void
  removeStumpNode(...args: any[]): void
  setStumpNodeAttr(...args: any[]): void
  setStumpNodeTreeComponent(...args: any[]): void
  setStumpNodeCss(...args: any[]): void
  shouldCollapse(...args: any[]): void
  stumpNodeHasClass(...args: any[]): void
  toHtmlWithSuids(...args: any[]): void
}

class TreeComponentCommander extends AbstractCommander {
  stopPropagationCommand() {
    // intentional noop
  }

  async clearMessageBufferCommand() {
    const treeComponent = this.getTarget()
    delete treeComponent._messageBuffer
  }

  async unmountAndDestroyCommand() {
    const treeComponent = this.getTarget()
    treeComponent.unmountAndDestroy()
  }
}

abstract class AbstractTreeComponent extends jtree.GrammarBackedNonRootNode {
  private _commandsBuffer: treeNotationTypes.treeNode[]
  private _messageBuffer: treeNotationTypes.treeNode
  private _htmlStumpNode: abstractHtmlTag
  private _cssStumpNode: abstractHtmlTag
  private _lastRenderedTime: number
  private _lastTimeToRender: number
  static _mountedTreeComponents = 0

  getParseErrorCount() {
    if (!this.length) return 0
    return this.getTopDownArray()
      .map((child: any) => child.getParseErrorCount())
      .reduce((sum: number, num: number) => sum + num)
  }

  getRootNode(): AbstractTreeComponentRootNode {
    return <AbstractTreeComponentRootNode>super.getRootNode()
  }

  getStumpNode() {
    return this._htmlStumpNode
  }

  getHakon() {
    return ""
  }

  getTheme(): AbstractTheme {
    return this.getRootNode().getTheme()
  }

  getCommandsBuffer() {
    if (!this._commandsBuffer) this._commandsBuffer = []
    return this._commandsBuffer
  }

  addToCommandLog(command: string) {
    this.getCommandsBuffer().push({
      command: command,
      time: this._getProcessTimeInMilliseconds()
    })
  }

  getMessageBuffer() {
    if (!this._messageBuffer) this._messageBuffer = new jtree.TreeNode()
    return this._messageBuffer
  }

  // todo: move this to tree class? or other higher level class?
  addStumpCodeMessageToLog(message: string) {
    // note: we have 1 parameter, and are going to do type inference first.
    // Todo: add actions that can be taken from a message?
    // todo: add tests
    this.getMessageBuffer().appendLineAndChildren("message", message)
  }

  addStumpErrorMessageToLog(errorMessage: string) {
    return this.addStumpCodeMessageToLog(`div
 class OhayoError
 bern${jtree.TreeNode.nest(errorMessage, 2)}`)
  }

  logMessageText(message = "") {
    const pre = `pre
 bern${jtree.TreeNode.nest(message, 2)}`
    return this.addStumpCodeMessageToLog(pre)
  }

  unmount(): any {
    if (
      !this.isMounted() // todo: why do we need this check?
    )
      return undefined
    this._getChildTreeComponents().forEach((child: any) => child.unmount())
    this.treeComponentWillUnmount()
    this._removeCss()
    this._removeHtml()
    delete this._lastRenderedTime
    this.treeComponentDidUnmount()
  }

  _removeHtml() {
    this._htmlStumpNode.removeStumpNode()
    delete this._htmlStumpNode
  }

  getStumpCode() {
    return `div
 class ${this.getCssClassNames()}`
  }

  getCssClassNames() {
    return this.constructor.name
  }

  treeComponentWillMount() {}

  treeComponentDidMount() {
    AbstractTreeComponent._mountedTreeComponents++
  }

  treeComponentDidUnmount() {
    AbstractTreeComponent._mountedTreeComponents--
  }

  treeComponentWillUnmount() {}

  forceUpdate() {}

  getNewestTimeToRender() {
    return this._lastTimeToRender
  }

  _setLastRenderedTime(time: number) {
    this._lastRenderedTime = time
    return this
  }

  // todo: can this be async?
  treeComponentDidUpdate() {}

  _getChildTreeComponents() {
    return this.getChildrenByNodeConstructor(AbstractTreeComponent)
  }

  // todo: delete this
  makeAllDirty() {
    this.makeDirty()
    this._getChildTreeComponents().forEach((child: any) => child.makeAllDirty())
  }

  _hasChildrenTreeComponents() {
    return this._getChildTreeComponents().length > 0
  }

  // todo: this is hacky. we do it so we can just mount all tiles to wall.
  getStumpNodeForChildren() {
    return this.getStumpNode()
  }

  _getLastRenderedTime() {
    return this._lastRenderedTime
  }

  // todo: delete this
  makeDirty() {
    this._setLastRenderedTime(0)
  }

  _getCss() {
    return this.getTheme().hakonToCss(this.getHakon())
  }

  toPlainHtml(containerId: string) {
    return `<div id="${containerId}">
 <style>${this.getTheme().hakonToCss(this.getHakon())}</style>
${new stumpNode(this.getStumpCode()).compile()}
</div>`
  }

  _getCssStumpCode() {
    return `styleTag
 stumpStyleFor ${this.constructor.name}
 bern${jtree.TreeNode.nest(this._getCss(), 2)}`
  }

  isNotATile() {
    // quick hacky way to get around children problem
    return true
  }

  _updateAndGetUpdateResult() {
    if (!this._shouldTreeComponentUpdate()) return { treeComponentDidUpdate: false, reason: "_shouldTreeComponentUpdate is false" }

    this._setLastRenderedTime(this._getProcessTimeInMilliseconds())
    this._removeCss()
    this._mountCss()
    // todo: fucking switch to react? looks like we don't update parent because we dont want to nuke children.
    // okay. i see why we might do that for non tile treeComponents. but for Tile treeComponents, seems like we arent nesting, so why not?
    // for now
    if (this.isNotATile() && this._hasChildrenTreeComponents()) return { treeComponentDidUpdate: false, reason: "is a parent" }

    this.updateHtml()

    this._lastTimeToRender = this._getProcessTimeInMilliseconds() - this._getLastRenderedTime()
    return { treeComponentDidUpdate: true }
  }

  _getWrappedStumpCode(index: number) {
    return this.getStumpCode()
  }

  updateHtml() {
    const stumpNodeToMountOn = <abstractHtmlTag>this._htmlStumpNode.getParent()
    const index = this._htmlStumpNode.getIndex()
    this._removeHtml()
    this._mountHtml(stumpNodeToMountOn, index)
  }

  unmountAndDestroy() {
    this.unmount()
    return this.destroy()
  }

  // todo: move to keyword node class?
  toggle(firstWord: string, contentOptions: string[]) {
    const currentNode = <AbstractTreeComponent>this.getNode(firstWord)
    if (!contentOptions) return currentNode ? currentNode.unmountAndDestroy() : this.appendLine(firstWord)
    const currentContent = currentNode === undefined ? undefined : currentNode.getContent()

    const index = contentOptions.indexOf(currentContent)
    const newContent = index === -1 || index + 1 === contentOptions.length ? contentOptions[0] : contentOptions[index + 1]

    this.delete(firstWord)
    if (newContent) this.touchNode(firstWord).setContent(newContent)
    return newContent
  }

  isMounted() {
    return !!this._htmlStumpNode
  }

  // todo: move to base TreeNode?
  getNextOrPrevious(arr: AbstractTreeComponent[]) {
    const length = arr.length
    const index = arr.indexOf(this)
    if (length === 1) return undefined
    if (index === length - 1) return arr[index - 1]
    return arr[index + 1]
  }

  toggleAndRender(firstWord: string, contentOptions: string[]) {
    this.toggle(firstWord, contentOptions)
    this.getRootNode().renderAndGetRenderResult()
  }

  _getFirstOutdatedDependency(lastRenderedTime = this._getLastRenderedTime() || 0) {
    return this.getDependencies().find(dep => dep.getLineModifiedTime() > lastRenderedTime)
  }

  _getReasonForUpdatingOrNot(): reasonForUpdatingOrNot {
    const mTime = this.getLineModifiedTime()
    const lastRenderedTime = this._getLastRenderedTime() || 0
    const staleTime = mTime - lastRenderedTime
    if (lastRenderedTime === 0)
      return {
        shouldUpdate: true,
        reason: "TreeComponent hasn't been rendered yet",
        staleTime: staleTime
      }

    if (staleTime > 0)
      return {
        shouldUpdate: true,
        reason: "TreeComponent itself changed",
        staleTime: staleTime
      }

    const outdatedDependency = this._getFirstOutdatedDependency(lastRenderedTime)
    if (outdatedDependency)
      return {
        shouldUpdate: true,
        reason: "A dependency changed",
        dependency: outdatedDependency,
        staleTime: outdatedDependency.getLineModifiedTime() - lastRenderedTime
      }
    return {
      shouldUpdate: false,
      reason: "No render needed",
      lastRenderedTime: lastRenderedTime,
      mTime: mTime
    }
  }

  getDependencies(): AbstractTreeComponent[] {
    return []
  }

  getChildrenThatNeedRendering() {
    const all: childShouldUpdateResult[] = []
    this._getTreeComponentsThatNeedRendering(all)
    return all
  }

  _shouldTreeComponentUpdate() {
    return this._getReasonForUpdatingOrNot().shouldUpdate
  }

  _getTreeComponentsThatNeedRendering(arr: childShouldUpdateResult[]) {
    this._getChildTreeComponents().forEach((child: AbstractTreeComponent) => {
      if (!child.isMounted() || child._shouldTreeComponentUpdate()) arr.push({ child: child, childUpdateBecause: child._getReasonForUpdatingOrNot() })
      child._getTreeComponentsThatNeedRendering(arr)
    })
  }

  _mount(stumpNodeToMountOn: abstractHtmlTag, index: number) {
    this._setLastRenderedTime(this._getProcessTimeInMilliseconds())

    this.treeComponentWillMount()

    this._mountCss()
    this._mountHtml(stumpNodeToMountOn, index) // todo: add index back?

    this._lastTimeToRender = this._getProcessTimeInMilliseconds() - this._getLastRenderedTime()
    return this
  }

  // todo: we might be able to squeeze virtual dom in here on the mountCss and mountHtml methods.
  _mountCss() {
    // todo: only insert css once per class? have a set?
    this._cssStumpNode = this._getPageHeadStump().insertCssChildNode(this._getCssStumpCode())
  }

  _getPageHeadStump(): abstractHtmlTag {
    return this.getRootNode()
      .getWillowProgram()
      .getHeadStumpNode()
  }

  _removeCss() {
    this._cssStumpNode.removeCssStumpNode()
    delete this._cssStumpNode
  }

  _mountHtml(stumpNodeToMountOn: abstractHtmlTag, index: number) {
    this._htmlStumpNode = stumpNodeToMountOn.insertChildNode(this._getWrappedStumpCode(index), index)
    if (!this._htmlStumpNode.setStumpNodeTreeComponent) console.log(this._htmlStumpNode)
    this._htmlStumpNode.setStumpNodeTreeComponent(this)
  }

  _treeComponentDidUpdate() {
    this.treeComponentDidUpdate()
  }

  _treeComponentDidMount() {
    this.treeComponentDidMount()
  }

  renderAndGetRenderResult(stumpNode?: abstractHtmlTag, index?: number) {
    const isUpdateOp = this.isMounted()
    let treeComponentUpdateResult = {
      treeComponentDidUpdate: false
    }
    if (isUpdateOp) treeComponentUpdateResult = this._updateAndGetUpdateResult()
    else this._mount(stumpNode, index)

    const stumpNodeForChildren = this.getStumpNodeForChildren()

    // Todo: insert delayed rendering?
    const childResults = this._getChildTreeComponents().map((child: any, index: number) => child.renderAndGetRenderResult(stumpNodeForChildren, index))

    if (isUpdateOp) {
      if (treeComponentUpdateResult.treeComponentDidUpdate) {
        try {
          this._treeComponentDidUpdate()
        } catch (err) {
          console.error(err)
        }
      }
    } else {
      try {
        this._treeComponentDidMount()
      } catch (err) {
        console.error(err)
      }
    }

    return {
      type: isUpdateOp ? "update" : "mount",
      treeComponentUpdateResult: treeComponentUpdateResult,
      children: childResults
    }
  }
}

class TreeComponentFrameworkDebuggerComponent extends AbstractTreeComponent {
  getHakon() {
    return `.TreeComponentFrameworkDebuggerComponent
 position fixed
 top 5
 left 5
 z-index 1000
 background rgba(254,255,156, .9)
 box-shadow 1px 1px 1px rgba(0,0,0,.5)
 padding 12px
 overflow scroll
 max-height 500px
.TreeComponentFrameworkDebuggerComponentCloseButton
 position absolute
 cursor pointer
 opacity .9
 top 2px
 right 2px
 &:hover
  opacity 1`
  }

  getStumpCode() {
    const app: any = this.getRootNode()
    return `div
 class TreeComponentFrameworkDebuggerComponent
 div x
  class TreeComponentFrameworkDebuggerComponentCloseButton
  stumpOnClickCommand toggleTreeComponentFrameworkDebuggerCommand
 div
  span This app is powered by the
  a Tree Component Framework
   href https://github.com/treenotation/jtree/tree/master/treeComponentFramework
 pre
  bern
${app.toString(3)}`
  }
}

abstract class AbstractTreeComponentRootNode extends AbstractTreeComponent {
  private _willowProgram: any
  private _theme: AbstractTheme

  getTheme(): AbstractTheme {
    if (!this._theme) this._theme = new DefaultTheme()
    return this._theme
  }

  getWillowProgram() {
    if (!this._willowProgram) {
      if (this.isNodeJs()) {
        this._willowProgram = new WillowProgram("http://localhost:8000/")
      } else {
        this._willowProgram = new WillowBrowserProgram(window.location.href)
      }
    }
    return this._willowProgram
  }

  protected _commander: AbstractCommander = new TreeComponentCommander(this)

  getCommander() {
    return this._commander
  }

  treeComponentDidMount() {}

  // todo: remove?
  protected async appWillFirstRender() {}
  // todo: remove?
  protected async appDidFirstRender() {}

  protected onCommandError(err: any) {
    throw new err()
  }

  _setTreeComponentFrameworkEventListeners() {
    const willowBrowser = this.getWillowProgram()
    const bodyShadow = willowBrowser.getBodyStumpNode().getShadow()
    const commander = <any>this.getCommander()

    const checkAndExecute = (el: any, attr: string, evt: any) => {
      const stumpNode = willowBrowser.getStumpNodeFromElement(el)
      evt.preventDefault()
      evt.stopImmediatePropagation()
      const commandWithArgs = stumpNode.getStumpNodeAttr(attr)
      const commandArgs = commandWithArgs.split(" ")
      const command = commandArgs.shift()
      try {
        commander[command](...commandArgs)
      } catch (err) {
        this.onCommandError(err)
      }
      return false
    }

    const DataShadowEvents = WillowConstants.DataShadowEvents

    bodyShadow.onShadowEvent(WillowConstants.ShadowEvents.contextmenu, `[${DataShadowEvents.onContextMenuCommand}]`, function(evt: any) {
      if (evt.ctrlKey) return true
      return checkAndExecute(this, DataShadowEvents.onContextMenuCommand, evt)
    })

    bodyShadow.onShadowEvent(WillowConstants.ShadowEvents.click, `[${DataShadowEvents.onClickCommand}]`, function(evt: any) {
      if (evt.shiftKey) return checkAndExecute(this, DataShadowEvents.onShiftClickCommand, evt)
      return checkAndExecute(this, DataShadowEvents.onClickCommand, evt)
    })
  }

  abstract getDefaultStartState(): string

  static async startApp(appClass: AbstractTreeComponentRootNode) {
    document.addEventListener(
      "DOMContentLoaded",
      async () => {
        const win = <any>window
        if (!win.app) {
          const startState = appClass.getDefaultStartState()
          const anyAppClass = <any>appClass // todo: cleanup
          win.app = new anyAppClass(startState)
          win.app._setTreeComponentFrameworkEventListeners()
          await win.app.appWillFirstRender()
          win.app.renderAndGetRenderResult(win.app.getWillowProgram().getBodyStumpNode())
          win.app.appDidFirstRender()
        }
      },
      false
    )
  }
}

abstract class AbstractGithubTriangleComponent extends AbstractTreeComponent {
  githubLink = `https://github.com/treenotation/jtree`

  getHakon() {
    return `.AbstractGithubTriangleComponent
 display block
 position absolute
 top 0
 right 0`
  }
  getStumpCode() {
    return `a
 class AbstractGithubTriangleComponent
 href ${this.githubLink}
 img
  src /github-fork.svg`
  }
}

export { AbstractTreeComponentRootNode, AbstractGithubTriangleComponent, AbstractTreeComponent, AbstractCommander, WillowConstants, WillowProgram, TreeComponentFrameworkDebuggerComponent }
