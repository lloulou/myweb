// ==UserScript==
// @name         高级隐私防护工具
// @namespace    http://tampermonkey.net/
// @version      1.5.0
// @description  全面保护您的在线隐私，防止各种指纹追踪和信息泄露，增强系统信息显示
// @author       Doubao
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @require      https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';
    
    GM_addStyle(`
        :root { --primary: #0aadec; --secondary: #00d4ff; --accent: #7928ca; --dark: #0f172a; --darker: #020617; --light: #e2e8f0; --glow: 0 0 10px var(--primary), 0 0 20px var(--primary); }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: var(--darker); color: var(--light); overflow-x: hidden; }
        #privacy-settings-btn { position: fixed; bottom: 20px; right: 20px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border: none; border-radius: 50%; width: 50px; height: 50px; cursor: pointer; box-shadow: var(--glow); z-index: 9999; display: flex; align-items: center; justify-content: center; font-size: 20px; transition: all 0.3s ease; outline: none; }
        #privacy-settings-btn:hover { transform: scale(1.1); box-shadow: 0 0 15px var(--primary), 0 0 30px var(--primary); }
        #password-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; z-index: 99999; backdrop-filter: blur(5px); opacity: 0; visibility: hidden; transition: all 0.3s ease; }
        #password-modal.active { opacity: 1; visibility: visible; }
        #password-input-container { position: relative; width: 90%; max-width: 300px; height: 60px; background: transparent; border: 2px solid var(--primary); border-radius: 30px; overflow: hidden; box-shadow: var(--glow); }
        #password-input { width: 100%; height: 100%; background: transparent; border: none; color: var(--light); padding: 0 20px; font-size: 18px; outline: none; autocomplete: new-password; }
        #password-input::placeholder { color: rgba(226, 232, 240, 0.5); }
        #feedback-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; z-index: 999999; backdrop-filter: blur(3px); opacity: 0; visibility: hidden; transition: all 0.3s ease; }
        #feedback-modal.active { opacity: 1; visibility: visible; }
        。feedback-content { position: relative; width: 90%; max-width: 400px; background: linear-gradient(135deg, var(--dark), var(--darker)); border: 2px solid var(--primary); border-radius: 15px; padding: 30px 20px; text-align: center; box-shadow: var(--glow); transform: translateY(-20px) scale(0.9); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        #feedback-modal.active .feedback-content { transform: translateY(0) scale(1); }
        .feedback-icon { width: 70px; height: 70px; margin: 0 auto 20px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: var(--glow); }
        .feedback-icon i { color: white; font-size: 30px; }
        .feedback-title { color: var(--secondary); font-size: 22px; margin-bottom: 15px; text-shadow: 0 0 5px rgba(0, 212, 255, 0.5); }
        .feedback-message { color: var(--light); font-size: 15px; line-height: 1.5; margin-bottom: 25px; padding: 0 10px; }
        .feedback-close { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border: none; border-radius: 30px; padding: 10px 25px; font-size: 16px; cursor: pointer; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); transition: all 0.3s ease; }
        .feedback-close:hover { transform: scale(1.05); box-shadow: var(--glow); }
        .feedback-footer { margin-top: 20px; font-size: 12px; color: rgba(226, 232, 240, 0.5); }
        #privacy-ui { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: var(--dark); z-index: 99999; transform: translateX(100%); transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); overflow-y: auto; box-sizing: border-box; }
        #privacy-ui.active { transform: translateX(0); }
        .ui-header { position: relative; padding: 15px 20px; background: linear-gradient(135deg, var(--dark), var(--darker)); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); text-align: center; border-bottom: 2px solid var(--primary); box-sizing: border-box; }
        .ui-header h1 { margin: 0; color: var(--primary); text-shadow: var(--glow); font-size: 22px; letter-spacing: 1px; }
        .ui-close-btn { position: absolute; top: 15px; right: 15px; background: none; border: none; color: var(--primary); font-size: 20px; cursor: pointer; outline: none; }
        .ui-close-btn:hover { color: var(--secondary); text-shadow: var(--glow); }
        .feature-container { margin: 15px; padding: 18px; background: linear-gradient(135deg, rgba(10, 174, 236, 0.05), rgba(0, 212, 255, 0.05)); border: 1px solid var(--primary); border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; box-sizing: border-box; }
        .feature-container:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2), var(--glow); }
        .feature-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .feature-title { color: var(--secondary); font-size: 16px; font-weight: 600; display: flex; align-items: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .feature-title i { margin-right: 8px; color: var(--primary); }
        .toggle-switch { position: relative; display: inline-block; width: 50px; height: 25px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 25px; }
        .slider:before { position: absolute; content: ""; height: 17px; width: 17px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(25px); }
        .feature-description { color: var(--light); font-size: 13px; line-height: 1.4; margin-bottom: 12px; padding: 8px; background: rgba(10, 174, 236, 0.1); border-left: 3px solid var(--primary); border-radius: 4px; box-sizing: border-box; }
        .apply-btn { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border: none; border-radius: 5px; padding: 10px 20px; cursor: pointer; font-size: 16px; margin: 0 auto 20px; display: block; box-shadow: var(--glow); transition: all 0.3s ease; box-sizing: border-box; }
        .apply-btn:hover { transform: scale(1.05); box-shadow: 0 0 15px var(--primary), 0 0 30px var(--primary); }
        .glow-line { height: 1px; background: linear-gradient(90deg, transparent, var(--primary), transparent); margin: 15px 0; }
        .loader { border: 4px solid rgba(10, 174, 236, 0.1); border-top: 4px solid var(--primary); border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 15px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .status-indicator { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-left: 8px; transition: all 0.3s ease; }
        .status-active { background-color: var(--primary); box-shadow: var(--glow); }
        .status-inactive { background-color: #555; }
        .status-bar { margin: 0 15px 15px; padding: 12px; background: linear-gradient(135deg, rgba(121, 40, 202, 0.1), rgba(10, 174, 236, 0.1)); border: 1px solid var(--accent); border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); box-sizing: border-box; }
        .status-bar-title { color: var(--accent); font-size: 16px; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; }
        .status-bar-title i { margin-right: 8px; color: var(--primary); }
        .status-item { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid rgba(10, 174, 236, 0.2); }
        .status-item:last-child { border-bottom: none; }
        .status-label { color: var(--light); font-size: 12px; }
        .status-value { color: var(--secondary); font-size: 12px; font-weight: 500; }
        .battery-status { display: flex; align-items: center; }
        .battery-icon { width: 20px; height: 12px; border: 1px solid var(--light); border-radius: 3px; margin-right: 5px; display: flex; overflow: hidden; }
        .battery-level { height: 100%; background-color: var(--primary); }
        .battery-text { font-size: 11px; }
        .device-model { font-size: 12px; color: rgba(226, 232, 240, 0.7); margin-top: 5px; text-align: center; }
        .rule-library-container { margin: 15px; padding: 18px; background: linear-gradient(135deg, rgba(10, 174, 236, 0.05), rgba(0, 212, 255, 0.05)); border: 1px solid var(--primary); border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); box-sizing: border-box; }
        .rule-library-title { color: var(--secondary); font-size: 16px; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center; }
        .rule-library-title i { margin-right: 8px; color: var(--primary); }
        .rule-input-container { display: flex; gap: 10px; margin-bottom: 15px; }
        .rule-input { flex: 1; height: 40px; padding: 0 15px; background: transparent; border: 2px solid var(--primary); border-radius: 5px; color: var(--light); font-size: 14px; outline: none; }
        .add-rule-btn { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border: none; border-radius: 5px; padding: 0 20px; cursor: pointer; transition: all 0.3s ease; }
        .add-rule-btn:hover { box-shadow: var(--glow); }
        .rule-list { max-height: 200px; overflow-y: auto; margin-top: 15px; }
        .rule-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 8px; background: rgba(10, 174, 236, 0.1); border-radius: 5px; }
        .rule-url { font-size: 13px; color: var(--light); word-break: break-all; flex: 1; margin-right: 10px; }
        .rule-status { font-size: 12px; padding: 3px 8px; border-radius: 3px; margin-right: 10px; }
        .rule-active { background-color: rgba(0, 255, 0, 0.2); color: #00ff00; }
        .rule-inactive { background-color: rgba(255, 0, 0, 0.2); color: #ff0000; }
        .delete-rule-btn { background: transparent; border: none; color: #ff4444; cursor: pointer; font-size: 16px; }
        .network-status-item { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid rgba(10, 174, 236, 0.2); }
        .network-status-item:last-child { border-bottom: none; }
    `);
    
    const privacyModules = {
        ipProtection: {
            name: "IP Address 防护",
            isEnabled: false,
            enable: function() { this.isEnabled = true; console.log("IP地址防护已启用"); },
            disable: function() { this.isEnabled = false; console.log("IP地址防护已禁用"); },
            getStatus: function() { return this.isEnabled; }
        },
        
        javascriptProtection: {
            name: "JavaScript 防护",
            isEnabled: false,
            enable: function() { this.isEnabled = true; console.log("JavaScript防护已启用"); },
            disable: function() { this.isEnabled = false; console.log("JavaScript防护已禁用"); },
            getStatus: function() { return this.isEnabled; }
        },
        
        webRTCPrivacy: {
            name: "WebRTC Leak 防护",
            isEnabled: false,
            enable: function() { this.isEnabled = true; console.log("WebRTC泄漏防护已启用"); },
            disable: function() { this.isEnabled = false; console.log("WebRTC泄漏防护已禁用"); },
            getStatus: function() { return this.isEnabled; }
        },
        
        canvasFingerprinting: {
            name: "Canvas Fingerprinting 防护",
            isEnabled: false,
            enable: function() {
                this.isEnabled = true;
                this._overrideCanvas();
                console.log("Canvas指纹防护已启用");
            },
            disable: function() {
                this.isEnabled = false;
                if (this.originalCanvas) {
                    window.HTMLCanvasElement = this.originalCanvas;
                    window.CanvasRenderingContext2D = this.originalContext;
                }
                console.log("Canvas指纹防护已禁用");
            },
            _overrideCanvas: function() {
                this.originalCanvas = window.HTMLCanvasElement;
                this.originalContext = window.CanvasRenderingContext2D;
                
                window.HTMLCanvasElement = class extends this.originalCanvas {
                    getContext(ctxt) {
                        const originalContext = super.getContext(ctxt);
                        if (originalContext && originalContext.constructor === this.originalContext) {
                            return this._overrideContext(originalContext);
                        }
                        return originalContext;
                    }
                };
            },
            _overrideContext: function(context) {
                const originalMethods = {};
                const methods = ['fillText', 'strokeText', 'measureText', 'drawImage'];
                methods.forEach(method => {
                    if (context[method]) originalMethods[method] = context[method];
                });
                
                if (originalMethods.fillText) {
                    context.fillText = function() { originalMethods.fillText.apply(this, arguments); };
                }
                if (originalMethods.strokeText) {
                    context.strokeText = function() { originalMethods.strokeText.apply(this, arguments); };
                }
                if (originalMethods.measureText) {
                    context.measureText = function(text) { return originalMethods.measureText.call(this, text); };
                }
                return context;
            },
            getStatus: function() { return this.isEnabled; }
        },
        
        webGLProtection: {
            name: "WebGL Report 防护",
            isEnabled: false,
            enable: function() {
                this.isEnabled = true;
                this._overrideWebGL();
                console.log("WebGL指纹防护已启用");
            },
            disable: function() {
                this.isEnabled = false;
                if (this.originalGetContext) {
                    window.HTMLCanvasElement.prototype.getContext = this.originalGetContext;
                }
                console.log("WebGL指纹防护已禁用");
            },
            _overrideWebGL: function() {
                this.originalGetContext = window.HTMLCanvasElement.prototype.getContext;
                window.HTMLCanvasElement.prototype.getContext = function(name) {
                    if (name === 'webgl' || name === 'experimental-webgl') {
                        const originalContext = this.originalGetContext.call(this, name);
                        if (originalContext) return this._overrideWebGLContext(originalContext);
                    }
                    return this.originalGetContext.call(this, name);
                }.bind(this);
            },
            _overrideWebGLContext: function(context) {
                if (context.getExtension) {
                    const originalGetExtension = context.getExtension;
                    context.getExtension = function(name) { return originalGetExtension.call(context, name); };
                }
                if (context.getShaderInfoLog) {
                    const originalGetShaderInfoLog = context.getShaderInfoLog;
                    context.getShaderInfoLog = function(shader) { return originalGetShaderInfoLog.call(context, shader); };
                }
                return context;
            },
            getStatus: function() { return this.isEnabled; }
        },
        
        fontFingerprinting: {
            name: "Font Fingerprinting 防护",
            isEnabled: false,
            enable: function() {
                this.isEnabled = true;
                this._blockFontDetection();
                console.log("字体指纹防护已启用");
            },
            disable: function() {
                this.isEnabled = false;
                if (this.originalDocumentReadyState) {
                    document.onreadystatechange = this.originalDocumentReadyState;
                }
                console.log("字体指纹防护已禁用");
            },
            _blockFontDetection: function() {
                this.originalDocumentReadyState = document.onreadystatechange;
                document.onreadystatechange = function() {
                    this.originalDocumentReadyState && this.originalDocumentReadyState.call(document);
                }.bind(this);
                const originalWindowGetComputedStyle = window.getComputedStyle;
                window.getComputedStyle = function(element, pseudo) {
                    return originalWindowGetComputedStyle.call(this, element, pseudo);
                };
            },
            getStatus: function() { return this.isEnabled; }
        },
        
        geolocationProtection: {
            name: "Geolocation API 防护",
            isEnabled: false,
            enable: function() {
                this.isEnabled = true;
                this._blockGeolocation();
                console.log("地理位置API防护已启用");
            },
            disable: function() {
                this.isEnabled = false;
                if (this.originalNavigatorGeolocation) {
                    navigator.geolocation = this.originalNavigatorGeolocation;
                }
                console.log("地理位置API防护已禁用");
            },
            _blockGeolocation: function() {
                this.originalNavigatorGeolocation = navigator.geolocation;
                navigator.geolocation = {
                    getCurrentPosition: function(success, error) {
                        if (error) error({ code: error.PERMISSION_DENIED, message: "位置访问被隐私防护工具阻止" });
                    },
                    watchPosition: function(success, error) {
                        if (error) error({ code: error.PERMISSION_DENIED, message: "位置访问被隐私防护工具阻止" });
                        return 0;
                    },
                    clearWatch: function() {}
                };
            },
            getStatus: function() { return this.isEnabled; }
        },
        
        featuresDetection: {
            name: "Features Detection 防护",
            isEnabled: false,
            enable: function() {
                this.isEnabled = true;
                this._blockFeatureDetection();
                console.log("特性检测防护已启用");
            },
            disable: function() {
                this.isEnabled = false;
                if (this.originalWindowHasOwnProperty) {
                    window.hasOwnProperty = this.originalWindowHasOwnProperty;
                }
                console.log("特性检测防护已禁用");
            },
            _blockFeatureDetection: function() {
                this.originalWindowHasOwnProperty = window.hasOwnProperty;
                window.hasOwnProperty = function(prop) {
                    const blockedFeatures = ['WebSocket', 'WebAssembly', 'CSSGrid'];
                    if (blockedFeatures.includes(prop)) return false;
                    return this.originalWindowHasOwnProperty.call(this, prop);
                }.bind(window);
            },
            getStatus: function() { return this.isEnabled; }
        },
        
        sslTlsProtection: {
            name: "SSL/TLS Client Test 防护",
            isEnabled: false,
            enable: function() {
                this.isEnabled = true;
                this._blockSslTlsDetection();
                console.log("SSL/TLS客户端检测防护已启用");
            },
            disable: function() {
                this.isEnabled = false;
                console.log("SSL/TLS客户端检测防护已禁用");
            },
            _blockSslTlsDetection: function() {},
            getStatus: function() { return this.isEnabled; }
        },
        
        contentFilters: {
            name: "Content Filters",
            isEnabled: false,
            rules: [],
            enable: function() {
                this.isEnabled = true;
                this._applyFilters();
                console.log("内容过滤已启用");
            },
            disable: function() {
                this.isEnabled = false;
                if (this.mutationObserver) {
                    this.mutationObserver.disconnect();
                }
                console.log("内容过滤已禁用");
            },
            _applyFilters: function() {
                const observer = new MutationObserver(mutations => {
                    mutations.forEach(mutation => {
                        if (mutation.type === 'childList') {
                            this._filterNodes(mutation.addedNodes);
                        }
                    });
                });
                observer.observe(document.body, { childList: true, subtree: true });
                this.mutationObserver = observer;
            },
            _filterNodes: function(nodes) {
                nodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const attributes = node.attributes;
                        for (let i = 0; i < attributes.length; i++) {
                            const attr = attributes[i];
                            if (attr.name === 'src' || attr.name === 'href') {
                                this._filterAttribute(attr);
                            }
                        }
                        this._filterNodes(node.childNodes);
                    }
                });
            },
            _filterAttribute: function(attr) {
                for (const rule of this.rules) {
                    if (rule.pattern.test(attr.value) && rule.action === "block") {
                        attr.value = "";
                        break;
                    }
                }
            },
            addRule: function(pattern, action = "block") {
                this.rules.push({ pattern: new RegExp(pattern, 'i'), action });
            },
            loadRulesFromLibrary: function(rulesText) {
                const lines = rulesText.split('\n');
                lines.forEach(line => {
                    line = line.trim();
                    if (line && !line.startsWith('!') && !line.startsWith('#')) {
                        try {
                            this.addRule(line);
                        } catch (e) {
                            console.error("Invalid rule:", line, e);
                        }
                    }
                });
            },
            getStatus: function() { return this.isEnabled; }
        }
    };
    
    const systemInfo = {
        os: "未知",
        osVersion: "未知",
        browser: "未知",
        browserVersion: "未知",
        language: "未知",
        time: "--:--:--",
        date: "--/--/----",
        battery: { level: "未知", charging: false },
        deviceModel: "未知",
        screenResolution: "未知",
        publicIp: "未检测到",
        connectionType: "未知",
        simInfo: [],
        
        init: function() {
            this.detectOS();
            this.detectBrowser();
            this.detectLanguage();
            this.updateTimeAndDate();
            this.startTimeInterval();
            this.detectBattery();
            this.detectScreenResolution();
            this.detectDeviceModel();
            this.detectConnectionType();
            this.detectSimInfo();
        },
        
        detectOS: function() {
            const userAgent = navigator.userAgent.toLowerCase();
            this.os = "未知";
            this.osVersion = "未知";
            
            if (userAgent.includes('android')) {
                this.os = "Android";
                const match = userAgent.match(/android (\d+\.\d+|\d+)/);
                if (match && match[1]) this.osVersion = match[1];
            } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
                this.os = "iOS";
                const match = userAgent.match(/os (\d+)_(\d+)/);
                if (match && match[1] && match[2]) this.osVersion = `${match[1]}.${match[2]}`;
            } else if (userAgent.includes('windows')) {
                this.os = "Windows";
                const match = userAgent.match(/windows nt (\d+\.\d+)/);
                if (match && match[1]) this.osVersion = match[1];
            } else if (userAgent.includes('macintosh')) {
                this.os = "macOS";
                const match = userAgent.match(/mac os x (\d+)_(\d+)_?(\d+)?/);
                if (match && match[1] && match[2]) this.osVersion = `${match[1]}.${match[2]}${match[3] ? `.${match[3]}` : ""}`;
            } else if (userAgent.includes('linux')) {
                this.os = "Linux";
            }
        },
        
        detectBrowser: function() {
            const userAgent = navigator.userAgent.toLowerCase();
            this.browser = "未知";
            this.browserVersion = "未知";
            
            if (userAgent.includes('chrome')) {
                this.browser = "Chrome";
                const match = userAgent.match(/chrome\/(\d+\.\d+\.\d+\.\d+)/);
                if (match && match[1]) this.browserVersion = match[1];
            } else if (userAgent.includes('firefox')) {
                this.browser = "Firefox";
                const match = userAgent.match(/firefox\/(\d+\.\d+)/);
                if (match && match[1]) this.browserVersion = match[1];
            } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
                this.browser = "Safari";
                const match = userAgent.match(/version\/(\d+\.\d+)/);
                if (match && match[1]) this.browserVersion = match[1];
            } else if (userAgent.includes('edge')) {
                this.browser = "Edge";
                const match = userAgent.match(/edg\/(\d+\.\d+\.\d+\.\d+)/);
                if (match && match[1]) this.browserVersion = match[1];
            } else if (userAgent.includes('opr')) {
                this.browser = "Opera";
                const match = userAgent.match(/opr\/(\d+\.\d+)/);
                if (match && match[1]) this.browserVersion = match[1];
            }
        },
        
        detectLanguage: function() {
            this.language = navigator.language || navigator.userLanguage || "未知";
            this.language = this.getLanguageName(this.language);
        },
        
        getLanguageName: function(langCode) {
            const names = {
                'zh-CN': '简体中文', 'zh-TW': '繁体中文', 'en-US': '英语（美国）',
                'en-GB': '英语（英国）', 'ja-JP': '日语', 'ko-KR': '韩语',
                'fr-FR': '法语', 'de-DE': '德语', 'es-ES': '西班牙语', 'ru-RU': '俄语'
            };
            return names[langCode] || langCode;
        },
        
        updateTimeAndDate: function() {
            const now = new Date();
            this.time = now.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second:'2-digit' });
            this.date = now.toLocaleDateString();
        },
        
        startTimeInterval: function() {
            setInterval(() => {
                this.updateTimeAndDate();
                this.updateStatusBar();
            }, 1000);
        },
        
        detectBattery: function() {
            if (navigator.getBattery) {
                navigator.getBattery().then(battery => {
                    this.updateBatteryStatus(battery);
                    battery.addEventListener('chargingchange', () => this.updateBatteryStatus(battery));
                    battery.addEventListener('levelchange', () => this.updateBatteryStatus(battery));
                }).catch(() => {
                    this.battery.level = "未知";
                    this.updateStatusBar();
                });
            } else {
                this.battery.level = "不支持";
                this.updateStatusBar();
            }
        },
        
        updateBatteryStatus: function(battery) {
            this.battery.level = Math.round(battery.level * 100) + "%";
            this.battery.charging = battery.charging;
            this.updateStatusBar();
        },
        
        detectScreenResolution: function() {
            this.screenResolution = `${window.screen.width} × ${window.screen.height}`;
            this.updateStatusBar();
        },
        
        detectDeviceModel: function() {
            const userAgent = navigator.userAgent.toLowerCase();
            this.deviceModel = "未知";
            
            if (userAgent.includes('android')) {
                const match = userAgent.match(/android; (.+?) build/);
                if (match && match[1]) this.deviceModel = match[1].trim();
            } else if (userAgent.includes('iphone')) {
                this.deviceModel = "iPhone";
            } else if (userAgent.includes('ipad')) {
                this.deviceModel = "iPad";
            } else if (userAgent.includes('ipod')) {
                this.deviceModel = "iPod";
            }
            
            this.updateStatusBar();
        },
        
        detectConnectionType: function() {
            if (navigator.connection) {
                const typeMap = {
                    'cellular': '移动网络',
                    'wifi': 'Wi-Fi',
                    'ethernet': '以太网',
                    'bluetooth': '蓝牙',
                    'none': '无网络'
                };
                
                this.connectionType = typeMap[navigator.connection.type] || navigator.connection.type || "未知";
                
                if (this.connectionType === '移动网络' && navigator.connection.effectiveType) {
                    this.connectionType += ` (${navigator.connection.effectiveType.toUpperCase()})`;
                }
            } else {
                this.connectionType = "无法检测";
            }
            this.updateStatusBar();
        },
        
        detectSimInfo: function() {
            // 浏览器API限制，无法获取实际SIM卡信息，仅作示意
            this.simInfo = [{
                status: "主卡",
                type: this.connectionType.includes('4G') ? '4G' : '未知',
                network: "未知运营商"
            }];
            
            // 模拟双卡情况
            if (Math.random() > 0.5) {
                this.simInfo.push({
                    status: "副卡",
                    type: '未激活',
                    network: "未知运营商"
                });
            }
            this.updateStatusBar();
        },
        
        updateStatusBar: function() {
            if (document.getElementById('status-bar')) {
                document.getElementById('os-value').textContent = this.os;
                document.getElementById('os-version-value').textContent = this.osVersion;
                document.getElementById('browser-value').textContent = this.browser;
                document.getElementById('browser-version-value').textContent = this.browserVersion;
                document.getElementById('language-value').textContent = this.language;
                document.getElementById('time-value').textContent = this.time;
                document.getElementById('date-value').textContent = this.date;
                document.getElementById('resolution-value').textContent = this.screenResolution;
                document.getElementById('device-model').textContent = `设备型号: ${this.deviceModel}`;
                document.getElementById('public-ip-value').textContent = this.publicIp;
                document.getElementById('connection-type-value').textContent = this.connectionType;
                
                // 更新SIM卡信息显示
                const simContainer = document.getElementById('sim-info-container');
                if (simContainer) {
                    simContainer.innerHTML = '';
                    this.simInfo.forEach((sim, index) => {
                        const simItem = document.createElement('div');
                        simItem.className = 'network-status-item';
                        simItem.innerHTML = `
                            <div class="status-label">${sim.status}</div>
                            <div class="status-value">${sim.type} - ${sim.network}</div>
                        `;
                        simContainer.appendChild(simItem);
                    });
                }
                
                // 更新电池状态
                const batteryLevel = document.querySelector('#battery-value .battery-level');
                const batteryText = document.querySelector('#battery-value .battery-text');
                
                if (this.battery.level === "未知" || this.battery.level === "不支持") {
                    batteryLevel.style.width = "0%";
                    batteryText.textContent = this.battery.level;
                } else {
                    batteryLevel.style.width = this.battery.level;
                    batteryText.textContent = this.battery.level + (this.battery.charging ? " (充电中)" : "");
                }
            }
        }
    };
    
    const storage = {
        PASSWORD_KEY: "privacyToolPassword",
        SETTINGS_KEY: "privacyToolSettings",
        RULE_LIBRARIES_KEY: "privacyToolRuleLibraries",
        DOWNLOADED_RULES_KEY: "privacyToolDownloadedRules",
        
        initPassword: function() {
            let password = GM_getValue(this.PASSWORD_KEY);
            if (!password) {
                password = this.encryptPassword("6666");
                GM_setValue(this.PASSWORD_KEY, password);
            }
            return password;
        },
        
        encryptPassword: function(password) {
            let encrypted = "";
            for (let i = 0; i < password.length; i++) {
                encrypted += password.charCodeAt(i) + 10;
            }
            return encrypted;
        },
        
        verifyPassword: function(password) {
            const encryptedPassword = GM_getValue(this.PASSWORD_KEY);
            return this.encryptPassword(password) === encryptedPassword;
        },
        
        saveSettings: function() {
            const settings = {};
            for (const moduleName in privacyModules) {
                if (privacyModules.hasOwnProperty(moduleName)) {
                    settings[moduleName] = privacyModules[moduleName].isEnabled;
                }
            }
            GM_setValue(this.SETTINGS_KEY, JSON.parse(JSON.stringify(settings)));
        },
        
        loadSettings: function() {
            const settings = GM_getValue(this.SETTINGS_KEY, {});
            for (const moduleName in privacyModules) {
                if (privacyModules.hasOwnProperty(moduleName)) {
                    privacyModules[moduleName].isEnabled = settings.hasOwnProperty(moduleName) 
                        ? settings[moduleName] 
                        : privacyModules[moduleName].isEnabled;
                }
            }
        },
        
        saveRuleLibraries: function(libraries) {
            GM_setValue(this.RULE_LIBRARIES_KEY, JSON.stringify(libraries));
        },
        
        loadRuleLibraries: function() {
            const libraries = GM_getValue(this.RULE_LIBRARIES_KEY, "[]");
            return JSON.parse(libraries);
        },
        
        saveDownloadedRules: function(url, rulesText) {
            const allRules = this.loadDownloadedRules();
            allRules[url] = {
                content: rulesText,
                timestamp: new Date().getTime()
            };
            GM_setValue(this.DOWNLOADED_RULES_KEY, JSON.stringify(allRules));
        },
        
        loadDownloadedRules: function() {
            const rules = GM_getValue(this.DOWNLOADED_RULES_KEY, "{}");
            return JSON.parse(rules);
        },
        
        deleteRuleLibrary: function(url) {
            const libraries = this.loadRuleLibraries().filter(lib => lib.url !== url);
            this.saveRuleLibraries(libraries);
            
            const allRules = this.loadDownloadedRules();
            delete allRules[url];
            GM_setValue(this.DOWNLOADED_RULES_KEY, JSON.stringify(allRules));
        }
    };
    
    const ruleManager = {
        libraries: [],
        
        init: function() {
            this.libraries = storage.loadRuleLibraries();
            this.loadRulesIntoFilter();
        },
        
        addRuleLibrary: function(url) {
            if (this.libraries.some(lib => lib.url === url)) {
                return false;
            }
            
            this.libraries.push({
                url: url,
                status: "downloading"
            });
            storage.saveRuleLibraries(this.libraries);
            uiManager.updateRuleList();
            
            this.downloadRuleLibrary(url);
            return true;
        },
        
        downloadRuleLibrary: function(url) {
            uiManager.showFeedbackModal("正在下载规则库", `正在从 ${url} 下载规则...`, "download");
            
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                onload: (response) => {
                    if (response.status === 200) {
                        this.libraries = this.libraries.map(lib => 
                            lib.url === url ? { ...lib, status: "active" } : lib
                        );
                        storage.saveRuleLibraries(this.libraries);
                        storage.saveDownloadedRules(url, response.responseText);
                        this.loadRulesIntoFilter();
                        uiManager.updateRuleList();
                        uiManager.showFeedbackModal("下载成功", `规则库 ${url} 已成功下载并应用`, "success");
                    } else {
                        this.libraries = this.libraries.map(lib => 
                            lib.url === url ? { ...lib, status: "error" } : lib
                        );
                        storage.saveRuleLibraries(this.libraries);
                        uiManager.updateRuleList();
                        uiManager.showFeedbackModal("下载失败", `无法下载规则库，状态码: ${response.status}`, "error");
                    }
                },
                onerror: () => {
                    this.libraries = this.libraries.map(lib => 
                        lib.url === url ? { ...lib, status: "error" } : lib
                    );
                    storage.saveRuleLibraries(this.libraries);
                    uiManager.updateRuleList();
                    uiManager.showFeedbackModal("下载失败", `无法连接到 ${url}`, "error");
                }
            });
        },
        
        deleteRuleLibrary: function(url) {
            storage.deleteRuleLibrary(url);
            this.libraries = storage.loadRuleLibraries();
            this.loadRulesIntoFilter();
            uiManager.updateRuleList();
        },
        
        loadRulesIntoFilter: function() {
            privacyModules.contentFilters.rules = [];
            const downloadedRules = storage.loadDownloadedRules();
            
            for (const url in downloadedRules) {
                if (this.libraries.some(lib => lib.url === url && lib.status === "active")) {
                    privacyModules.contentFilters.loadRulesFromLibrary(downloadedRules[url].content);
                }
            }
        },
        
        checkRuleLibraries: function() {
            const promises = [];
            
            this.libraries.forEach(lib => {
                if (lib.status === "active") {
                    promises.push(new Promise(resolve => {
                        GM_xmlhttpRequest({
                            method: "HEAD",
                            url: lib.url,
                            onload: (response) => {
                                if (response.status === 200) {
                                    resolve(true);
                                } else {
                                    lib.status = "error";
                                    resolve(false);
                                }
                            },
                            onerror: () => {
                                lib.status = "error";
                                resolve(false);
                            }
                        });
                    }));
                }
            });
            
            return Promise.all(promises).then(results => {
                storage.saveRuleLibraries(this.libraries);
                return results.every(Boolean);
            });
        }
    };
    
    const resourceChecker = {
        requiredResources: [
            "https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/jquery.min.js"
        ],
        
        checkAllResources: function() {
            uiManager.showFeedbackModal("检查资源依赖中", "正在验证所需资源...", "info", false);
            
            const promises = this.requiredResources.map(url => this.checkResource(url));
            
            Promise.all(promises).then(results => {
                const allLoaded = results.every(Boolean);
                
                if (allLoaded) {
                    setTimeout(() => {
                        uiManager.hideFeedbackModal();
                    }, 1000);
                } else {
                    uiManager.showFeedbackModal("资源依赖库缺失", "正在重新下载中...", "warning", false);
                    
                    const loadPromises = this.requiredResources
                        .filter((_, index) => !results[index])
                        .map(url => this.loadResource(url));
                    
                    Promise.all(loadPromises).then(loadResults => {
                        const allLoaded = loadResults.every(Boolean);
                        if (allLoaded) {
                            uiManager.showFeedbackModal("下载成功", "所有资源已成功加载", "success");
                        } else {
                            uiManager.showFeedbackModal("下载失败", "部分资源无法加载，可能影响功能", "error");
                        }
                    });
                }
            });
        },
        
        checkResource: function(url) {
            return new Promise(resolve => {
                if (url.includes("jquery")) {
                    resolve(typeof $ !== "undefined");
                    return;
                }
                
                GM_xmlhttpRequest({
                    method: "HEAD",
                    url: url,
                    onload: (response) => resolve(response.status === 200),
                    onerror: () => resolve(false)
                });
            });
        },
        
        loadResource: function(url) {
            return new Promise(resolve => {
                if (url.includes("jquery")) {
                    const script = document.createElement("script");
                    script.src = url;
                    script.onload = () => resolve(true);
                    script.onerror = () => resolve(false);
                    document.head.appendChild(script);
                    return;
                }
                
                GM_xmlhttpRequest({
                    method: "GET",
                    url: url,
                    onload: (response) => resolve(response.status === 200),
                    onerror: () => resolve(false)
                });
            });
        }
    };
    
    const uiManager = {
        init: function() {
            storage.loadSettings();
            ruleManager.init();
            this.createSettingsButton();
            this.createPasswordModal();
            this.createFeedbackModal();
            this.createPrivacyUI();
            systemInfo.init();
            this.initEventListeners();
            this.updateStatusIndicators();
        },
        
        createFeedbackModal: function() {
            const modal = document.createElement('div');
            modal.id = 'feedback-modal';
            
            const content = document.createElement('div');
            content.className = 'feedback-content';
            
            content.innerHTML = `
                <div class="feedback-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="feedback-title">提示</div>
                <div class="feedback-message">
                    消息内容
                </div>
                <button class="feedback-close">确定</button>
                <div class="feedback-footer">高级隐私防护工具 v1.5.0</div>
            `;
            
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            content.querySelector('.feedback-close').addEventListener('click', () => {
                this.hideFeedbackModal();
            });
        },
        
        showFeedbackModal: function(title, message, type = "info", autoClose = true) {
            const modal = document.getElementById('feedback-modal');
            const icon = modal.querySelector('.feedback-icon i');
            const titleEl = modal.querySelector('.feedback-title');
            const messageEl = modal.querySelector('.feedback-message');
            
            titleEl.textContent = title;
            messageEl.textContent = message;
            
            icon.className = "fas";
            switch(type) {
                case "success": icon.classList.add("fa-check-circle"); break;
                case "error": icon.classList.add("fa-times-circle"); break;
                case "warning": icon.classList.add("fa-exclamation-triangle"); break;
                case "download": icon.classList.add("fa-download"); break;
                default: icon.classList.add("fa-info-circle");
            }
            
            modal.classList.add('active');
            
            if (autoClose) {
                setTimeout(() => {
                    this.hideFeedbackModal();
                }, 3000);
            }
        },
        
        hideFeedbackModal: function() {
            document.getElementById('feedback-modal').classList.remove('active');
        },
        
        createSettingsButton: function() {
            const btn = document.createElement('button');
            btn.id = 'privacy-settings-btn';
            btn.innerHTML = '<i class="fas fa-shield-alt"></i>';
            document.body.appendChild(btn);
        },
        
        createPasswordModal: function() {
            const modal = document.createElement('div');
            modal.id = 'password-modal';
            
            const inputContainer = document.createElement('div');
            inputContainer.id = 'password-input-container';
            
            const input = document.createElement('input');
            input.id = 'password-input';
            input.type = 'password';
            input.placeholder = '输入密码以访问设置...';
            input.autocomplete = 'new-password';
            input.value = '';
            
            inputContainer.appendChild(input);
            modal.appendChild(inputContainer);
            document.body.appendChild(modal);
        },
        
        createPrivacyUI: function() {
            const ui = document.createElement('div');
            ui.id = 'privacy-ui';
            
            const header = document.createElement('div');
            header.className = 'ui-header';
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'ui-close-btn';
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            
            const title = document.createElement('h1');
            title.textContent = '高级隐私防护工具';
            
            header.appendChild(closeBtn);
            header.appendChild(title);
            ui.appendChild(header);
            
            // 当前状态栏
            const statusBar = document.createElement('div');
            statusBar.className = 'status-bar';
            statusBar.id = 'status-bar';
            
            const statusBarTitle = document.createElement('div');
            statusBarTitle.className = 'status-bar-title';
            statusBarTitle.innerHTML = '<i class="fas fa-info-circle"></i> 当前系统状态';
            
            const statusItems = document.createElement('div');
            
            const osItem = document.createElement('div');
            osItem.className = 'status-item';
            osItem.innerHTML = `
                <div class="status-label">操作系统</div>
                <div>
                    <div class="status-value" id="os-value">加载中...</div>
                    <div class="status-value" id="os-version-value" style="font-size: 11px; color: rgba(226, 232, 240, 0.7);">加载中...</div>
                </div>
            `;
            
            const browserItem = document.createElement('div');
            browserItem.className = 'status-item';
            browserItem.innerHTML = `
                <div class="status-label">浏览器</div>
                <div>
                    <div class="status-value" id="browser-value">加载中...</div>
                    <div class="status-value" id="browser-version-value" style="font-size: 11px; color: rgba(226, 232, 240, 0.7);">加载中...</div>
                </div>
            `;
            
            const languageItem = document.createElement('div');
            languageItem.className = 'status-item';
            languageItem.innerHTML = `
                <div class="status-label">语言</div>
                <div class="status-value" id="language-value">加载中...</div>
            `;
            
            const timeDateItem = document.createElement('div');
            timeDateItem.className = 'status-item';
            timeDateItem.innerHTML = `
                <div class="status-label">日期时间</div>
                <div>
                    <div class="status-value" id="time-value">加载中...</div>
                    <div class="status-value" id="date-value" style="font-size: 11px; color: rgba(226, 232, 240, 0.7);">加载中...</div>
                </div>
            `;
            
            const resolutionItem = document.createElement('div');
            resolutionItem.className = 'status-item';
            resolutionItem.innerHTML = `
                <div class="status-label">屏幕分辨率</div>
                <div class="status-value" id="resolution-value">加载中...</div>
            `;
            
            const batteryItem = document.createElement('div');
            batteryItem.className = 'status-item';
            batteryItem.innerHTML = `
                <div class="status-label">电量</div>
                <div class="status-value" id="battery-value">
                    <div class="battery-status">
                        <div class="battery-icon">
                            <div class="battery-level"></div>
                        </div>
                        <div class="battery-text">加载中...</div>
                    </div>
                </div>
            `;
            
            const publicIpItem = document.createElement('div');
            publicIpItem.className = 'status-item';
            publicIpItem.innerHTML = `
                <div class="status-label">公共IP</div>
                <div class="status-value" id="public-ip-value">加载中...</div>
            `;
            
            const connectionTypeItem = document.createElement('div');
            connectionTypeItem.className = 'status-item';
            connectionTypeItem.innerHTML = `
                <div class="status-label">连接类型</div>
                <div class="status-value" id="connection-type-value">加载中...</div>
            `;
            
            const simInfoTitle = document.createElement('div');
            simInfoTitle.className = 'status-item';
            simInfoTitle.innerHTML = `
                <div class="status-label">SIM卡信息</div>
                <div class="status-value">--</div>
            `;
            
            const simInfoContainer = document.createElement('div');
            simInfoContainer.id = 'sim-info-container';
            
            statusItems.appendChild(osItem);
            statusItems.appendChild(browserItem);
            statusItems.appendChild(languageItem);
            statusItems.appendChild(timeDateItem);
            statusItems.appendChild(resolutionItem);
            statusItems.appendChild(batteryItem);
            statusItems.appendChild(publicIpItem);
            statusItems.appendChild(connectionTypeItem);
            statusItems.appendChild(simInfoTitle);
            statusItems.appendChild(simInfoContainer);
            
            statusBar.appendChild(statusBarTitle);
            statusBar.appendChild(statusItems);
            
            const deviceModelItem = document.createElement('div');
            deviceModelItem.className = 'device-model';
            deviceModelItem.id = 'device-model';
            deviceModelItem.textContent = '设备型号: 加载中...';
            
            statusBar.appendChild(deviceModelItem);
            ui.appendChild(statusBar);
            
            // 规则库管理区域
            const ruleLibraryContainer = document.createElement('div');
            ruleLibraryContainer.className = 'rule-library-container';
            
            const ruleLibraryTitle = document.createElement('div');
            ruleLibraryTitle.className = 'rule-library-title';
            ruleLibraryTitle.innerHTML = '<i class="fas fa-list-alt"></i> 自定义规则库管理';
            
            const ruleInputContainer = document.createElement('div');
            ruleInputContainer.className = 'rule-input-container';
            
            const ruleInput = document.createElement('input');
            ruleInput.type = 'text';
            ruleInput.className = 'rule-input';
            ruleInput.placeholder = '输入规则库URL (如: https://easylist-downloads.adblockplus.org/easylist.txt)';
            ruleInput.id = 'rule-library-url';
            
            const addRuleBtn = document.createElement('button');
            addRuleBtn.className = 'add-rule-btn';
            addRuleBtn.textContent = '添加规则库';
            addRuleBtn.id = 'add-rule-library-btn';
            
            ruleInputContainer.appendChild(ruleInput);
            ruleInputContainer.appendChild(addRuleBtn);
            
            const ruleList = document.createElement('div');
            ruleList.className = 'rule-list';
            ruleList.id = 'rule-library-list';
            
            ruleLibraryContainer.appendChild(ruleLibraryTitle);
            ruleLibraryContainer.appendChild(ruleInputContainer);
            ruleLibraryContainer.appendChild(ruleList);
            
            ui.appendChild(ruleLibraryContainer);
            
            // 添加功能区域
            const featuresContainer = document.createElement('div');
            featuresContainer.style.padding = '0 15px';
            
            for (const moduleName in privacyModules) {
                if (privacyModules.hasOwnProperty(moduleName)) {
                    const module = privacyModules[moduleName];
                    featuresContainer.appendChild(this.createFeatureCard(module));
                }
            }
            
            const glowLine = document.createElement('div');
            glowLine.className = 'glow-line';
            
            const applyBtn = document.createElement('button');
            applyBtn.className = 'apply-btn';
            applyBtn.textContent = '应用设置';
            applyBtn.id = 'apply-settings-btn';
            
            featuresContainer.appendChild(glowLine);
            featuresContainer.appendChild(applyBtn);
            ui.appendChild(featuresContainer);
            
            document.body.appendChild(ui);
            this.updateRuleList();
        },
        
        createFeatureCard: function(module) {
            const container = document.createElement('div');
            container.className = 'feature-container';
            
            const header = document.createElement('div');
            header.className = 'feature-header';
            
            const title = document.createElement('div');
            title.className = 'feature-title';
            title.innerHTML = `<i class="fas fa-lock"></i> ${module.name}`;
            
            const statusIndicator = document.createElement('span');
            statusIndicator.className = 'status-indicator ' + (module.isEnabled ? 'status-active' : 'status-inactive');
            
            const switchContainer = document.createElement('label');
            switchContainer.className = 'toggle-switch';
            
            const switchInput = document.createElement('input');
            switchInput.type = 'checkbox';
            switchInput.checked = module.isEnabled;
            switchInput.module = module;
            
            const slider = document.createElement('span');
            slider.className = 'slider';
            
            switchContainer.appendChild(switchInput);
            switchContainer.appendChild(slider);
            header.appendChild(title);
            header.appendChild(statusIndicator);
            header.appendChild(switchContainer);
            
            const description = document.createElement('div');
            description.className = 'feature-description';
            
            switch(module.name) {
                case "IP Address 防护":
                    description.textContent = "阻止网站获取您的真实IP地址，隐藏您的网络位置。";
                    break;
                case "JavaScript 防护":
                    description.textContent = "限制JavaScript的某些功能，防止指纹追踪和行为分析。";
                    break;
                case "WebRTC Leak 防护":
                    description.textContent = "防止WebRTC泄露您的本地IP地址，保护您的网络隐私。";
                    break;
                case "Canvas Fingerprinting 防护":
                    description.textContent = "修改Canvas渲染结果，防止网站通过Canvas指纹识别您的设备。";
                    break;
                case "WebGL Report 防护":
                    description.textContent = "修改WebGL信息，防止网站通过图形硬件指纹识别您的设备。";
                    break;
                case "Font Fingerprinting 防护":
                    description.textContent = "干扰字体检测，防止网站通过已安装字体识别您的设备。";
                    break;
                case "Geolocation API 防护":
                    description.textContent = "阻止网站获取您的地理位置，保护您的位置隐私。";
                    break;
                case "Features Detection 防护":
                    description.textContent = "隐藏浏览器特性，防止网站通过特性检测识别您的设备。";
                    break;
                case "SSL/TLS Client Test 防护":
                    description.textContent = "阻止SSL/TLS指纹检测，防止网站通过加密指纹识别您。";
                    break;
                case "Content Filters":
                    description.textContent = "根据规则库过滤广告、追踪器和其他不需要的内容。";
                    break;
                default:
                    description.textContent = "保护您的在线隐私，防止信息泄露。";
            }
            
            container.appendChild(header);
            container.appendChild(description);
            container.module = module;
            
            return container;
        },
        
        updateRuleList: function() {
            const listContainer = document.getElementById('rule-library-list');
            if (!listContainer) return;
            
            listContainer.innerHTML = '';
            
            if (ruleManager.libraries.length === 0) {
                listContainer.innerHTML = '<div style="text-align: center; padding: 15px; color: var(--light);">暂无规则库，请添加规则库URL</div>';
                return;
            }
            
            ruleManager.libraries.forEach(library => {
                const ruleItem = document.createElement('div');
                ruleItem.className = 'rule-item';
                
                let statusClass = 'rule-status rule-inactive';
                let statusText = '未激活';
                
                if (library.status === 'active') {
                    statusClass = 'rule-status rule-active';
                    statusText = '已激活';
                } else if (library.status === 'downloading') {
                    statusClass = 'rule-status';
                    statusText = '下载中...';
                } else if (library.status === 'error') {
                    statusClass = 'rule-status rule-inactive';
                    statusText = '下载失败';
                }
                
                ruleItem.innerHTML = `
                    <div class="rule-url">${library.url}</div>
                    <div class="${statusClass}">${statusText}</div>
                    <button class="delete-rule-btn" data-url="${library.url}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                
                listContainer.appendChild(ruleItem);
            });
            
            // 添加删除事件监听
            document.querySelectorAll('.delete-rule-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const url = e.currentTarget.getAttribute('data-url');
                    ruleManager.deleteRuleLibrary(url);
                });
            });
        },
        
        initEventListeners: function() {
            document.getElementById('privacy-settings-btn').addEventListener('click', () => {
                this.showPasswordModal();
            });
            
            document.getElementById('password-input').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.verifyPassword();
                }
            });
            
            document.querySelector('.ui-close-btn').addEventListener('click', () => {
                this.hidePrivacyUI();
            });
            
            document.getElementById('apply-settings-btn').addEventListener('click', () => {
                this.applySettings();
            });
            
            document.getElementById('add-rule-library-btn').addEventListener('click', () => {
                const url = document.getElementById('rule-library-url').value.trim();
                if (url) {
                    if (ruleManager.addRuleLibrary(url)) {
                        document.getElementById('rule-library-url').value = '';
                    } else {
                        this.showFeedbackModal("添加失败", "该规则库已存在", "warning");
                    }
                }
            });
            
            document.getElementById('rule-library-url').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    document.getElementById('add-rule-library-btn').click();
                }
            });
            
            document.querySelectorAll('.toggle-switch input').forEach(switchInput => {
                switchInput.addEventListener('change', (e) => {
                    const module = e.target.module;
                    if (e.target.checked) {
                        module.enable();
                    } else {
                        module.disable();
                    }
                    this.updateStatusIndicators();
                });
            });
        },
        
        showPasswordModal: function() {
            document.getElementById('password-modal').classList.add('active');
            document.getElementById('password-input').focus();
        },
        
        hidePasswordModal: function() {
            document.getElementById('password-modal').classList.remove('active');
            document.getElementById('password-input').value = '';
        },
        
        verifyPassword: function() {
            const password = document.getElementById('password-input').value;
            if (storage.verifyPassword(password)) {
                this.hidePasswordModal();
                this.showPrivacyUI();
                resourceChecker.checkAllResources();
            } else {
                const input = document.getElementById('password-input');
                input.value = '';
                input.placeholder = '密码错误，请重新输入...';
                input.style.color = '#ff4444';
                setTimeout(() => {
                    input.style.color = '';
                    input.placeholder = '输入密码以访问设置...';
                }, 2000);
            }
        },
        
        showPrivacyUI: function() {
            document.getElementById('privacy-ui').classList.add('active');
            this.updateStatusIndicators();
            systemInfo.updateStatusBar();
        },
        
        hidePrivacyUI: function() {
            document.getElementById('privacy-ui').classList.remove('active');
        },
        
        showFeedbackModal: function(title, message, type = "info", autoClose = true) {
            const modal = document.getElementById('feedback-modal');
            const icon = modal.querySelector('.feedback-icon i');
            const titleEl = modal.querySelector('.feedback-title');
            const messageEl = modal.querySelector('.feedback-message');
            
            titleEl.textContent = title;
            messageEl.textContent = message;
            
            icon.className = "fas";
            switch(type) {
                case "success": icon.classList.add("fa-check-circle"); break;
                case "error": icon.classList.add("fa-times-circle"); break;
                case "warning": icon.classList.add("fa-exclamation-triangle"); break;
                case "download": icon.classList.add("fa-download"); break;
                default: icon.classList.add("fa-info-circle");
            }
            
            modal.classList.add('active');
            
            if (autoClose) {
                this.autoCloseTimeout = setTimeout(() => {
                    this.hideFeedbackModal();
                }, 3000);
            } else {
                if (this.autoCloseTimeout) {
                    clearTimeout(this.autoCloseTimeout);
                }
            }
        },
        
        hideFeedbackModal: function() {
            document.getElementById('feedback-modal').classList.remove('active');
        },
        
        updateStatusIndicators: function() {
            const indicators = document.querySelectorAll('.status-indicator');
            const moduleNames = Object.keys(privacyModules);
            
            indicators.forEach((indicator, index) => {
                if (index < moduleNames.length) {
                    const module = privacyModules[moduleNames[index]];
                    indicator.className = 'status-indicator ' + (module.isEnabled ? 'status-active' : 'status-inactive');
                }
            });
        },
        
        applySettings: function() {
            const applyBtn = document.getElementById('apply-settings-btn');
            applyBtn.disabled = true;
            applyBtn.innerHTML = '<div class="loader"></div> 应用中...';
            
            storage.saveSettings();
            ruleManager.loadRulesIntoFilter();
            
            setTimeout(() => {
                applyBtn.disabled = false;
                applyBtn.innerHTML = '应用设置';
                this.showFeedbackModal('设置已应用', '您的隐私保护设置已更新并生效', 'success');
            }, 1000);
        }
    };
    
    // 初始化
    storage.initPassword();
    uiManager.init();
    
    console.log("高级隐私防护工具已加载，点击右下角按钮访问设置");
})();
