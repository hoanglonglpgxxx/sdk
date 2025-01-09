class ChatWindow {
    async init(config) {
        this.site = config.site || window.location.origin;
        this.chatGPTImg = config.chatGPTImg ?? 'https://haiduong-chatbot.coquan.net/upload/2006916/20250102/Group_0daaf.png';
        this.bigIconChat = config.bigIconChat ?? 'https://haiduong-chatbot.coquan.net/upload/2006916/20250102/bot_main_img_c172f.png';
        this.title = config.title || 'Trợ lý ảo';
        this.defaultMessage = config.defaultMessage || 'Xin chào anh/chị. Tôi là Trợ Lý Ảo của Sở Thông Tin và Truyền Thông Hải Dương. Anh/Chị cần hỗ trợ gì về các thủ tục hành chính của Tỉnh Hải Dương không ạ?';
        this.lastMessageTime = null;
        this.basePerformanceTime = null;
        this.serverTimeInitialized = false;
        this.serverStartTime = null;
        this.defaultErrMsg = "Trợ lý ảo hiện không thể phản hồi, vui lòng thử lại sau.";
        this.endConvMsg = config.endConvMsg || 'Cảm ơn anh/chị đã quan tâm!';
        this.msgInterval = parseInt(config.msgInterval, 10) ?? 60000;
        this.configCSS = config.configCSS || 'https://haiduong-chatbot.coquan.net/3rdparty/ChatBotSDK/css/style.css';
        this.jqueryPath = config.jqueryPath || 'https://haiduong-chatbot.coquan.net/3rdparty/ChatBotSDK/js/jquery.min.js';
        this.bootstrapIconPath = config.bootstrapIconPath || 'https://haiduong-chatbot.coquan.net/3rdparty/ChatBotSDK/css/bootstrap-glyphicons.css';
        this.sendEndPoint = config.sendEndPoint || 'api/Extra/ChatBot/Chat/send';
        if (typeof jQuery === 'undefined') {
            this.loadScript(jqueryPath);
        }
        this.processedElements = new Set();

        this.loadCSS(this.configCSS);
        this.loadCSS(bootstrapIconPath);
        this.setRootCSS('primary', config.primary ?? 'blue');

        let p = `<div id="chat-GPT" class="chatGPT-icon chatbot-icon"><div class="icon-container"></div><a href="javascript:void(0);" class="chatGPT-icon-action"><img alt="ChatIcon" src="${this.bigIconChat}" height="80" /></a><span class="x-botchat" id="x-botchat"><svg width="16" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.729 5.285 C 5.520 5.388,5.294 5.645,5.233 5.848 C 5.128 6.197,5.025 6.078,8.113 9.170 L 10.939 12.000 8.113 14.830 C 5.009 17.938,5.128 17.801,5.237 18.165 C 5.304 18.388,5.618 18.700,5.835 18.759 C 6.214 18.861,6.061 18.993,9.170 15.887 L 12.000 13.061 14.830 15.887 C 17.939 18.993,17.786 18.861,18.165 18.759 C 18.386 18.699,18.699 18.386,18.759 18.165 C 18.861 17.786,18.993 17.939,15.887 14.830 L 13.061 12.000 15.887 9.170 C 18.993 6.061,18.861 6.214,18.759 5.835 C 18.700 5.618,18.388 5.304,18.165 5.237 C 17.801 5.128,17.938 5.009,14.830 8.113 L 12.000 10.939 9.190 8.131 C 7.229 6.172,6.335 5.305,6.231 5.262 C 6.033 5.179,5.933 5.184,5.729 5.285 " stroke="none" fill-rule="evenodd" fill="black"></path></svg></span></div><div id="chat-window" class="chat-window"></div>`;
        document.body.innerHTML += p;

        this.initEvents();
    }

    setRootCSS(name, val) {
        let r = document.querySelector(':root');
        r.style.setProperty(`--${name}`, val);
    }

    loadCSS(val) {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = val;
        document.head.appendChild(link);
    }

    loadScript(val) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = val;
            script.async = true;

            script.onerror = reject;

            script.onload = script.onreadystatechange = function () {
                const loadState = this.readyState;

                if (loadState && loadState !== 'loaded' && loadState !== 'complete') return;

                script.onload = script.onreadystatechange = null;

                resolve();
            };

            document.head.appendChild(script);
        });
    }

    initEvents() {
        let that = this,
            chatGPTIcon = document.querySelector('.chatGPT-icon'),
            xBotChat = document.querySelector('.x-botchat'),
            chatWindow = document.getElementById('chat-window');
        chatGPTIcon.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!document.querySelector('.window-chatbot')) {
                chatWindow.appendChild(that.createChatWindow());
                setTimeout(() => {
                    const msgInput = document.getElementById('input-message');
                    msgInput.addEventListener('paste', (event) => {
                        event.preventDefault();

                        const pasteContent = (event.clipboardData || window.clipboardData).getData('text');

                        const strippedContent = that.stripHTML(pasteContent);
                        const inputMessage = document.getElementById('input-message');
                        inputMessage.innerText += strippedContent;
                        const range = document.createRange();
                        const selection = window.getSelection();
                        range.selectNodeContents(inputMessage);
                        range.collapse(false);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    });

                    that.handleScrollUp();
                }, 300);
            } else {
                document.querySelector('.window-chatbot').style.display = 'flex';
            }
            chatGPTIcon.style.display = 'none';
        });
        xBotChat.addEventListener('click', function (e) {
            e.stopPropagation();
            if (chatGPTIcon) {
                chatGPTIcon.remove();
                chatWindow.remove();
            }
        });

        document.addEventListener('click', function (event) {
            if (event.target.classList.contains('other-info')) {
                that.handleQuestDetail(event.target);
            }
        });
    }

    createElement(tag, classNames, attributes = {}) {
        const element = document.createElement(tag);
        if (classNames) {
            element.className = classNames;
        }
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
        return element;
    }

    createChatWindow() {
        const chatWindow = this.createElement('div', 'window-chatbot');

        const header = this.createElement('div', 'header align-center  ');

        const headerImgContainer = this.createElement('div', 'header-img');
        const headerImg = this.createElement('img', '', {
            src: this.chatGPTImg,
            width: 50,
            alt: ''
        });
        headerImgContainer.appendChild(headerImg);

        const headerTitle = this.createElement('div', 'header-title text-bold padding-h-sm');
        headerTitle.textContent = this.title;

        const headerActions = this.createElement('div', 'header-actions d-flex  ');

        const fullWindowLink = this.createElement('a', 'full-window action-button', {
            href: 'javascript:void(0)'
        });
        fullWindowLink.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.840 2.238 C 14.833 2.259,14.736 2.262,14.604 2.340 C 14.419 2.449,14.318 2.596,14.277 2.815 C 14.208 3.182,14.331 3.499,14.604 3.660 C 14.735 3.737,14.823 3.740,16.957 3.752 L 19.175 3.764 16.231 6.712 C 12.996 9.951,13.139 9.785,13.241 10.165 C 13.301 10.386,13.614 10.699,13.835 10.759 C 14.215 10.861,14.049 11.004,17.288 7.769 L 20.236 4.825 20.248 7.043 C 20.260 9.177,20.263 9.265,20.340 9.396 C 20.449 9.581,20.596 9.682,20.815 9.723 C 21.182 9.792,21.499 9.669,21.660 9.396 C 21.738 9.264,21.741 9.169,21.760 6.100 C 21.771 4.362,21.766 2.884,21.750 2.815 C 21.677 2.518,21.386 2.264,21.080 2.231 C 21.003 2.223,19.545 2.226,17.840 2.238 M9.800 13.245 C 9.691 13.277,9.012 13.933,6.710 16.232 L 3.760 19.179 3.758 17.079 C 3.757 15.925,3.741 14.902,3.723 14.806 C 3.653 14.443,3.418 14.268,3.000 14.268 C 2.582 14.268,2.347 14.444,2.278 14.806 C 2.259 14.902,2.243 16.380,2.240 18.091 L 2.235 21.203 2.328 21.370 C 2.429 21.552,2.621 21.702,2.815 21.750 C 2.884 21.766,4.362 21.771,6.100 21.760 C 9.169 21.741,9.264 21.738,9.396 21.660 C 9.581 21.551,9.682 21.404,9.723 21.185 C 9.792 20.818,9.669 20.501,9.396 20.340 C 9.265 20.263,9.177 20.260,7.043 20.248 L 4.825 20.236 7.769 17.288 C 10.399 14.655,10.718 14.322,10.759 14.169 C 10.893 13.658,10.312 13.097,9.800 13.245 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>';

        const closeWindowLink = this.createElement('a', 'close-window action-button', {
            href: 'javascript:void(0)',
        });
        closeWindowLink.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.729 3.285 C 3.520 3.388,3.294 3.645,3.233 3.848 C 3.127 4.202,2.932 3.985,7.113 8.170 L 10.939 12.000 7.113 15.830 C 2.914 20.033,3.126 19.796,3.237 20.165 C 3.304 20.388,3.618 20.700,3.835 20.759 C 4.219 20.862,3.962 21.092,8.170 16.887 L 12.000 13.061 15.830 16.887 C 20.038 21.092,19.781 20.862,20.165 20.759 C 20.386 20.699,20.699 20.386,20.759 20.165 C 20.862 19.781,21.092 20.038,16.887 15.830 L 13.061 12.000 16.887 8.170 C 21.092 3.962,20.862 4.219,20.759 3.835 C 20.700 3.618,20.388 3.304,20.165 3.237 C 19.796 3.126,20.033 2.914,15.830 7.113 L 12.000 10.939 8.190 7.131 C 5.506 4.449,4.336 3.305,4.231 3.262 C 4.033 3.179,3.933 3.184,3.729 3.285 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>';

        headerActions.appendChild(fullWindowLink);
        headerActions.appendChild(closeWindowLink);
        closeWindowLink.addEventListener('click', this.closeWindow);
        fullWindowLink.addEventListener('click', this.fullScreen);

        header.appendChild(headerImgContainer);
        header.appendChild(headerTitle);
        header.appendChild(headerActions);

        const body = this.createElement('div', 'body scroll-container');

        const content = this.createElement('div', 'content', {
            id: `loadModuleChatDetail`,
            style: 'position: relative'
        });

        const messageScroller = this.createElement('div', 'message-scroller list-message-chat', {
            id: `list-message-chat`
        });

        const itemChat = this.createElement('div', 'message message-item margin-bottom-md d-flex');
        messageScroller.appendChild(itemChat);
        content.appendChild(messageScroller);
        body.appendChild(content);

        let time = this.getDate();
        let curDay = this.getDay();
        itemChat.innerHTML = `<div class="item-img">
        <img alt="" src="${this.chatGPTImg ? this.chatGPTImg : 'https://coquan.vn/Extra/ChatGPT/images/small-icon.png'}" onerror="this.src='./small-icon.png';" style="width: 50px;"/>
    </div>
    <div class="item-content">
        <div class="item-top">
            <div class="name text-bold">${this.title}</div> <div class="time first-mess">${curDay}</div>
        </div>
        <div class="item-bottom">
            <div class="title">${this.defaultMessage}</div>
        </div>
    </div>`;

        const footer = this.createElement('div', 'footer');

        const form = this.createElement('form', `formChatbot d-flex message-form`, {
            id: `formChatbot`,
            style: 'flex-direction: column'
        });

        /* const hiddenInput = this.createElement('input', '', {
            type: 'hidden',
            name: 'roomId',
        }); */
        const actions = this.createElement('div', 'list-action-chat full-width d-flex relative');
        actions.innerHTML = `<div id="input-message" contenteditable="true" class="message-content border-solid border-gray-lighten message-contentChatBot" name="title"></div><div><button type="button" class="submit submit-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.249 2.286 C 1.671 2.389,1.266 2.892,1.274 3.494 C 1.279 3.866,1.255 3.789,2.750 8.245 L 4.020 12.030 3.914 12.345 C 3.856 12.518,3.245 14.334,2.556 16.380 C 1.370 19.904,1.303 20.118,1.288 20.444 C 1.274 20.730,1.285 20.819,1.355 20.977 C 1.490 21.283,1.661 21.465,1.941 21.603 C 2.156 21.709,2.241 21.729,2.469 21.727 C 2.791 21.723,3.060 21.635,3.880 21.269 C 16.421 15.657,21.698 13.292,21.877 13.201 C 22.394 12.938,22.597 12.708,22.708 12.257 C 22.766 12.022,22.766 11.978,22.708 11.743 C 22.597 11.292,22.394 11.061,21.880 10.801 C 21.462 10.589,3.379 2.508,3.080 2.399 C 2.737 2.275,2.494 2.242,2.249 2.286 M11.970 7.992 C 16.870 10.185,20.880 11.989,20.880 12.001 C 20.880 12.035,2.955 20.048,2.931 20.024 C 2.919 20.013,3.457 18.378,4.126 16.392 L 5.342 12.780 8.121 12.760 L 10.900 12.740 11.051 12.646 C 11.270 12.510,11.338 12.357,11.339 12.000 C 11.340 11.642,11.246 11.452,11.009 11.334 C 10.869 11.264,10.695 11.259,8.094 11.248 L 5.328 11.237 4.124 7.637 C 3.462 5.657,2.920 4.018,2.920 3.994 C 2.920 3.970,2.950 3.963,2.990 3.978 C 3.029 3.993,7.070 5.799,11.970 7.992 " stroke="none" fill-rule="evenodd" fill="black"></path></svg></button></div>`;

        // form.appendChild(hiddenInput);
        form.appendChild(actions);
        footer.appendChild(form);

        chatWindow.appendChild(header);
        chatWindow.appendChild(body);
        chatWindow.appendChild(footer);

        this.initChat(chatWindow);
        return chatWindow;
    }

    getDate() {
        let currentDay = new Date().toLocaleString('en-us', { weekday: 'long' });

        let startDate = new Date();
        startDate.setHours(startDate.getHours() - 1);

        let elapsedMilliseconds = new Date() - startDate;
        let elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
        let elapsedMinutes = Math.floor(elapsedSeconds / 60);
        let elapsedHours = Math.floor(elapsedMinutes / 60);
        return {
            currentDay,
            elapsedHours,
            elapsedMinutes,
            elapsedSeconds
        };
    }

    notag(value) {
        if (value && typeof (value) === 'string') {
            value = value.replace(/&/g, '&amp;').replace(/'/g, '&#x27;')
                .replace(/"/g, '&quot;').replace(/</g, '&lt;')
                .replace(/>/g, '&gt;').replace(/\//g, '&#x2F;').replace(/\[\[b]]/g, '<b>')
                .replace(/\[\[&#x2F;b]]/g, '</b>');
        }
        return value;
    }

    alert(message, options) {
        let that = this;
        that.loadCSS(`https://haiduong-chatbot.coquan.net/3rdparty/ChatBotSDK/js/jquery.min.js/3rdparty/ChatBotSDK/css/lobibox.min.css`);
        that.loadScript(`https://haiduong-chatbot.coquan.net/3rdparty/ChatBotSDK/js/jquery.min.js/3rdparty/ChatBotSDK/js/lobibox.min.js`)
            .then(function () {
                if (!options) {
                    options = {
                        closeOnClick: true,
                        closable: true,
                    };
                }
                if (!options.title) {
                    switch (options.type) {
                        case 'success':
                            options.title = 'Thành công';
                            break;
                        case 'warning':
                            options.title = 'Cảnh báo';
                            break;
                        case 'error':
                            options.title = 'Có lỗi';
                            break;
                        default:
                            options.title = 'Thông báo';
                            break;
                    }
                }
                if (!options.msg) {
                    options.msg = message || (options.content || options.title);
                    if (!options.isHTML) {
                        options.msg = that.notag(options.msg);
                    }
                }
                if (!options.position) {
                    options.position = 'top right';
                }
                options.sound = false;
                if (options.msg.length > 100 && !options.width) {
                    options.width = 500;
                    if (options.msg.length > 600) {
                        options.messageHeight = 300;
                    }
                    else if (options.msg.length > 300) {
                        options.messageHeight = 200;
                    }
                }
                Lobibox[(options?.messageType) ? options.messageType : 'notify'](
                    options.type || 'info', options);
            });
    }

    initChat(chatWindow) {
        const moduleBody = $(chatWindow);
        const that = this;

        moduleBody.find('textarea').on('input', function () {
            that.resizeTextArea(this);
        });

        moduleBody.on('keypress', `.message-contentChatBot, .message-content`, function (event) {
            const textHTML = $(this).parents('form').find('div[contenteditable="true"]:first');
            if (event.which === 13 && !event.shiftKey) {
                event.preventDefault();
                if ($(this).val() || textHTML.html()) {
                    if (that.botOtherInfo && Object.keys(that.botOtherInfo).length
                        && (that.hasKey(that.botOtherInfo, textHTML.html()) ||
                            that.botOtherInfo?.title?.toLowerCase() === textHTML.html().toLowerCase())) {
                        that.handleBotOtherInfo(textHTML.html());
                    } else {
                        that.submitFunc(that.site, textHTML);
                    }
                } else {
                    that.alert("Vui lòng nhập nội dung", {
                        delay: 3000,
                        type: 'error'
                    });
                }
                return false;
            }
        });

        moduleBody.on('click', `.submit-button, .submit`, function (event) {
            const textHTML = $(this).parents('form').find('div[contenteditable="true"]:first');
            event.preventDefault();

            if (textHTML.html()) {
                if (that.botOtherInfo && Object.keys(that.botOtherInfo).length && that.hasKey(that.botOtherInfo, $(this).val())) {
                    that.handleBotOtherInfo(textHTML.html());
                } else {
                    that.submitFunc(that.site, textHTML);
                }
            } else {
                that.alert("Vui lòng nhập nội dung", {
                    delay: 3000,
                    type: 'error'
                });
            }
            return false;
        });
    }

    handleBotOtherInfo(str) {
        const elements = document.querySelectorAll(`.other-info[data-normal-title="${str}"]`);
        const lastElement = elements[elements.length - 1];

        if (lastElement) {
            lastElement.click();
        }

        setTimeout(() => {
            document.getElementById('input-message').innerHTML = '';
        }, 100);
    }

    hasKey(obj, str) {
        const lowerCaseKey = str.toLowerCase();

        function search(obj) {
            for (const key in obj) {
                if (key.toLowerCase() === lowerCaseKey) {
                    return true;
                }

                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    if (search(obj[key])) {
                        return true;
                    }
                }
            }
            return false;
        }

        return search(obj);
    }

    handleScrollUp() {
        let maxScrollTop = 0, curVal = 0;
        $('#chat-window .scroll-container').on('scroll', function () {
            let scroll = $(this).scrollTop();
            if (scroll > curVal) {
                $('#chat-window .scroll-container .backToBottom').remove();
            }
            else {
                if ($(this).find('.backToBottom').length < 1) {
                    $(this).append('<a href="javascript:void(0)" title="Tin mới nhất" class="backToBottom w-lg h-lg d-block d-flex align-center flex-center" style="text-decoration: none;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md text-token-text-primary"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 21C11.7348 21 11.4804 20.8946 11.2929 20.7071L4.29289 13.7071C3.90237 13.3166 3.90237 12.6834 4.29289 12.2929C4.68342 11.9024 5.31658 11.9024 5.70711 12.2929L11 17.5858V4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4V17.5858L18.2929 12.2929C18.6834 11.9024 19.3166 11.9024 19.7071 12.2929C20.0976 12.6834 20.0976 13.3166 19.7071 13.7071L12.7071 20.7071C12.5196 20.8946 12.2652 21 12 21Z" fill="currentColor"></path></svg></a>');
                }
                ;
            }
            curVal = scroll;
            if (scroll > maxScrollTop) {
                maxScrollTop = scroll;
            }

            $(this).trigger('showBackBtn');
            return maxScrollTop;
        });
        $('#chat-window .scroll-container').on('showBackBtn', function () {
            $('#chat-window .scroll-container .backToBottom').on('click', function () {
                $('.scroll-container').stop(true, false).animate({
                    scrollTop: maxScrollTop
                });
                $(this).remove();
            });
        });
    }

    submitOption(el) {
        this.submitFunc(this.site, $(el), true);
    }

    decodeHTMLEntities(input) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = input;
        return textarea.value;
    }

    stripTagsKeepText(input) {
        const div = document.createElement('div');
        div.innerHTML = input;
        return div.textContent || '';
    }

    async submitFunc(site, el, isOption = false) {
        let that = this;
        let rawContent = el.html();
        let decodedContent = this.decodeHTMLEntities(rawContent);
        let sanitizedContent = this.stripTagsKeepText(decodedContent);

        let initialMessageAdded = false;

        this.addMessage({}, sanitizedContent).then(() => {
            initialMessageAdded = true;
        });
        if (!isOption) {
            setTimeout(() => {
                el.text('');
            }, 100);
        };

        let mountpoint = `${site}/${this.sendEndPoint}?text=${encodeURIComponent(sanitizedContent)}`;
        try {
            const response = await fetch(mountpoint);
            if (!response.ok) {
                if (response.status === 504) {
                    this.alert("Máy chủ hiện không phản hồi. Vui lòng thử lại sau.", {
                        delay: 3000,
                        type: 'error'
                    });
                } else {
                    that.addBotSingleMessage(that.defaultErrMsg);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } else {
                const res = await response.json();
                while (!initialMessageAdded) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                await this.addMessage(res, sanitizedContent);
            }
        } catch (error) {
            this.alert("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.", {
                delay: 3000,
                type: 'error'
            });
            throw error;
        }
    }

    stripHTML(html) {
        return this.stripTagsKeepText(html);
    }

    scrollBottom() {
        let ul = $('#list-message-chat'),
            wrapper = $('.scroll-container:first');
        if (wrapper.length) {
            $(wrapper).animate({
                scrollTop: ul[0].scrollHeight ? ul[0].scrollHeight : 10000
            }, 500);
        }
    }

    replaceQuotesInTags(input) {
        return input.replace(/<[^>]*>/g, function (match) {
            return match.replace(/"/g, "'");
        });
    }

    addBotSingleMessage(str) {
        let botNewMessage = this.createElement('div'),
            chatContainer = document.querySelector('.list-message-chat'),
            that = this,
            time = parseInt(new Date(that.lastMessageTime).getTime(), 10) + that.msgInterval;
        let lastBotMsg = document.querySelector('.message-item:not(.me-message):last-of-type'),
            botImg = lastBotMsg.querySelector('.item-img img').getAttribute('src'),
            botFullName = lastBotMsg.querySelector('.item-content .item-top .name').innerText;
        botNewMessage.className = `message bot-default-msg message-item margin-bottom-md d-flex today comment-item chat-message`;

        botNewMessage.innerHTML = `<div class="item-img"><img style="width: 50px;" alt="" src="${botImg}" /></div><div class="item-content"><div class="item-top"><div class="name text-bold">${botFullName}</div> <div class="time bot-default-msg-time bot-time" data-time="${time / 1000}">Vừa xong</div></div><div class="item-bottom"><div class="title">${str ?? ''}</div></div></div>`;

        chatContainer.appendChild(botNewMessage);
        this.scrollBottom();
    }

    async addMessage(res, input, isAuto = false, detailVal = {}) {
        let newMessage = this.createElement('div'),
            botNewMessage = this.createElement('div'),
            chatContainer = document.querySelector('.list-message-chat'),
            time = this.getDate(),
            day = this.getDay(),
            msg = input,
            that = this;
        newMessage.className = `message message-item margin-bottom-md d-flex today me-message comment-item chat-message`;
        botNewMessage.className = `message message-item margin-bottom-md d-flex today comment-item chat-message`;

        let updateTime = (timeEl, createdTime, currentTime) => {
            let timeDifference = currentTime - createdTime,
                timeDifferenceInSeconds = Math.floor(timeDifference / 1000),
                timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60),
                timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60),
                timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);
            let displayText;
            if (timeDifferenceInDays > 0) {
                displayText = `${timeDifferenceInDays} ngày trước`;
            } else if (timeDifferenceInHours > 0) {
                displayText = `${timeDifferenceInHours} giờ trước`;
            } else if (timeDifferenceInMinutes > 0) {
                displayText = `${timeDifferenceInMinutes} phút trước`;
            } else {
                displayText = `${timeDifferenceInSeconds} giây trước`;
            }
            // console.log(timeEl, createdTime, currentTime, timeDifference);
            timeEl.textContent = displayText;
        };

        let updateTimeIntervalId;
        if (res.botAnswer) {
            let botRes = res.botAnswer;
            msg = botRes?.content;
            botNewMessage.innerHTML = `<div class="item-img"><img style="width: 50px;" alt="" src="${botRes.avartar ? botRes.avartar : (this.chatGPTImg ? this.chatGPTImg : 'https://coquan.vn/Extra/ChatGPT/images/small-icon.png')}" /></div><div class="item-content"><div class="item-top"><div class="name text-bold">${botRes.fullName ?? 'Bạn'}</div> <div class="time bot-time" data-time="${res.botAnswer.createdTime}">Vừa xong</div></div><div class="item-bottom"><div class="title">${msg ?? ''}</div></div></div>`;

            chatContainer.appendChild(botNewMessage);
            if (res.botAnswer.otherInfo && Object.keys(res.botAnswer.otherInfo).length) {
                let otherInfo = res.botAnswer.otherInfo;
                that.botOtherInfo = otherInfo;
                let otherInfoEntries = Object.entries(otherInfo);
                for (let [index, [key, val]] of Object.entries(otherInfoEntries)) {
                    let newObj = val;

                    let modifiedData = that.capitalizeFirstLetter(that.replaceQuotesInTags(key));

                    if (!that.isNestedObject(val)) {
                        // let cusObj = JSON.parse(val);
                        botNewMessage.querySelector('.title').insertAdjacentHTML('beforeend', `<a href="javascript:void(0)" class="other-info" data-content="${that.replaceQuotesInTags(val.data)}" data-index="${index}" data-title="${val.title}" data-normal-title="${val.title.toLowerCase()}" data-bot-full-name="${botRes.fullName ?? 'Trợ lý ảo'}" data-full-name="${res.fullName ?? 'Bạn'}">${val.title}</a>`);
                        let curItem = botNewMessage.querySelector(`.other-info[data-title="${val.title}"]`);
                        if (curItem) {
                            that.processNestedData(newObj, curItem, index);
                        }
                    } else {
                        // delete newObj.title;
                        // delete newObj.data;
                        // console.log(key, val, typeof val);
                        if (that.hasNumericKeys(val)) {
                            modifiedData = JSON.stringify(val).replace(/"/g, '&quot;');
                            botNewMessage.querySelector('.title').insertAdjacentHTML('beforeend', `<a href="javascript:void(0)" class="other-info sub-data" data-content-arr="${modifiedData}" data-index="${index}" data-title="${newObj.title}" data-normal-title="${newObj.title.toLowerCase()}" data-bot-full-name="${botRes.fullName ?? 'Trợ lý ảo'}" data-full-name="${res.fullName ?? 'Bạn'}">${newObj.title}</a>`);
                        } else {
                            botNewMessage.querySelector('.title').insertAdjacentHTML('beforeend', `<a href="javascript:void(0)" class="other-info" data-bot-full-name="${botRes.fullName ?? 'Trợ lý ảo'}" data-title="${modifiedData}" data-normal-title="${modifiedData.toLowerCase()}" data-index="${index}" data-full-name="${res.fullName ?? 'Bạn'}">${modifiedData}</a>`);
                            let curItem = botNewMessage.querySelector(`.other-info[data-title="${modifiedData}"]`);
                            if (curItem) {
                                that.processNestedData(newObj, curItem, index);
                            }
                        }

                        /*
                                                modifiedData = JSON.stringify(val).replace(/"/g, '&quot;');
                                                botNewMessage.querySelector('.title').insertAdjacentHTML('beforeend', `<a href="javascript:void(0)" class="other-info sub-data" data-content-arr="${modifiedData}" data-index="${index}" data-title="${val.title}" data-normal-title="${val.title.toLowerCase()}" data-bot-full-name="${botRes.fullName ?? 'Trợ lý ảo'}" data-full-name="${res.fullName ?? 'Bạn'}">${val.title}</a>`); */
                        /*   */
                    }
                }
            }

            if (res && !Object.keys(res.botAnswer.otherInfo).length && !res.botAnswer.otherInfo.length) {
                that.botOtherInfo = {};
            }
            this.scrollBottom();
        }

        let clientStartTime = null;
        let fetchServerTime = async () => {
            if (that.serverTimeInitialized) return;

            try {
                const response = await fetch('/');
                const serverTime = response.headers.get('Date');

                if (serverTime) {
                    that.serverStartTime = new Date(serverTime).getTime();
                    that.basePerformanceTime = performance.now();
                    that.serverTimeInitialized = true;
                } else {
                    throw new Error("Server time not available");
                }
            } catch (error) {
                console.error("Failed to fetch server time:", error);
                that.serverStartTime = Date.now();
                that.basePerformanceTime = performance.now();
                that.serverTimeInitialized = true;
            }
        };

        if (!that.serverTimeInitialized) {
            await fetchServerTime();
        }

        let getAccurateCurrentTime = () => {
            if (!that.serverStartTime || that.basePerformanceTime === null) {
                return null;
            }

            const elapsed = performance.now() - that.basePerformanceTime;
            return that.serverStartTime + elapsed;
        };

        const currentServerTime = getAccurateCurrentTime();
        if (!currentServerTime) {
            return;
        }

        if (Object.keys(res).length === 0 && !isAuto) {
            newMessage.innerHTML = `<div class="item-img"><img style="width: 50px;" alt="" src="${this.chatGPTImg ? this.chatGPTImg : 'https://coquan.vn/Extra/ChatGPT/images/small-icon.png'}" /></div><div class="item-content"><div class="item-top"><div class="name text-bold">${res.fullName ?? 'Bạn'}</div> <div class="time my-time" data-time=${Math.floor(currentServerTime / 1000)}>Vừa xong</div></div><div class="item-bottom"><div class="title">${msg ?? ''}</div></div></div>`;

            chatContainer.appendChild(newMessage);
        }
        if (isAuto) {
            let userQuest = detailVal.title ?? '',
                botRes = detailVal.content ?? '',
                botFullName = detailVal.botFullName ?? '',
                userFullName = detailVal.fullName ?? '',
                subData = detailVal.subData;
            newMessage.innerHTML = `<div class="item-img"><img style="width: 50px;" alt="" src="${this.chatGPTImg}" /></div><div class="item-content"><div class="item-top"><div class="name text-bold">${userFullName ?? 'Bạn'}</div> <div class="time my-time" data-time=${Math.floor(currentServerTime / 1000)}>Vừa xong</div></div><div class="item-bottom"><div class="title">${userQuest ?? ''}</div></div></div>`;
            chatContainer.appendChild(newMessage);
            botNewMessage.innerHTML = `<div class="item-img"><img style="width: 50px;" alt="" src="${botRes.avartar ? botRes.avartar : this.chatGPTImg}" /></div><div class="item-content"><div class="item-top"><div class="name text-bold">${botFullName ?? 'Bạn'}</div> <div class="time bot-time" data-time="${Math.floor(currentServerTime / 1000)}">Vừa xong</div></div><div class="item-bottom"><div class="title">${botRes ?? ''}</div></div></div>`;
            that.trimBrTags(newMessage.getElementsByClassName('title'));
            that.trimBrTags(botNewMessage.getElementsByClassName('title'));
            chatContainer.appendChild(botNewMessage);
            /* subData = {
                "0": {
                    "title": {
                        "title": "title",
                        "data": "Tờ khai ghi chú ly hôn theo mẫu (nếu người có yêu cầu lựa chọn nộp hồ sơ theo hình thức trực tiếp)"
                    },
                    "data": "",
                    "file": {
                        "title": "file",
                        "data": "tttl/30/giayto/2024_09/1725595787_9-_TK_ghi_chu_ly_hon.doc"
                    },
                    "sortOrder": {
                        "title": "sortOrder",
                        "data": "1"
                    }
                }
            } */
            if (subData) {
                let entriedSubData = Object.entries(subData);
                for (let [index, [key, val]] of Object.entries(entriedSubData)) {
                    let subArr = detailVal.nestedArr ? val : JSON.parse(val);
                    let modifiedData;
                    if (!that.isNestedObject(subArr)) {
                        modifiedData = that.replaceQuotesInTags(subArr.data);
                        botNewMessage.querySelector('.title').insertAdjacentHTML('beforeend', `<a href="javascript:void(0)" class="other-info" data-content="${modifiedData}" data-index="${index}" data-title="${subArr.title}" data-normal-title="${subArr.title.toLowerCase()}" data-bot-full-name="${botRes.fullName ?? 'Trợ lý ảo'}" data-full-name="${res.fullName ?? 'Bạn'}">${subArr.title}</a>`);

                        let curItem = botNewMessage.querySelector(`.other-info[data-index="${index}"]`);
                        if (curItem && that.isNestedObject(subArr)) {
                            that.processNestedData(subArr, curItem, index);
                        }
                    } else {
                        modifiedData = detailVal.nestedArr ? val : JSON.stringify(subArr).replace(/"/g, '&quot;');
                        if (detailVal.nestedArr) {
                            modifiedData = val;
                            let botContent = '';
                            for (let [nestedKey, nestedVal] of Object.entries(val)) {
                                if (nestedKey !== 'sortOrder') botContent += (nestedVal.data ?? '') + '<br>';
                            }
                            botNewMessage.innerHTML = `<div class="item-img"><img style="width: 50px;" alt="" src="${botRes.avartar ? botRes.avartar : this.chatGPTImg}" /></div><div class="item-content"><div class="item-top"><div class="name text-bold">${botFullName ?? 'Bạn'}</div> <div class="time bot-time" data-time="${Math.floor(currentServerTime / 1000)}">Vừa xong</div></div><div class="item-bottom"><div class="title">${botContent.trim() ?? ''}</div></div></div>`;
                        } else {
                            modifiedData = JSON.stringify(subArr).replace(/"/g, '&quot;');
                            botNewMessage.querySelector('.title').insertAdjacentHTML('beforeend', `<a href="javascript:void(0)" class="other-info sub-data" data-content-arr="${modifiedData}" data-index="${index}" data-title="${subArr.title}" data-normal-title="${subArr.title.toLowerCase()}" data-bot-full-name="${botRes.fullName ?? 'Trợ lý ảo'}" data-full-name="${res.fullName ?? 'Bạn'}">${subArr.title}</a>`);
                        }

                        /*   let curItem = botNewMessage.querySelector(`.other-info[data-index="${index}"]`);
                          if (curItem && that.isNestedObject(subArr)) {
                              that.processNestedData(subArr, curItem, index, true);
                          } */
                    }

                }
            }

            setTimeout(() => {
                that.scrollBottom();
            }, 100);
        }

        let updateTimeInterval = () => {
            if (!that.serverStartTime || !clientStartTime) return;

            const elapsed = Date.now() - clientStartTime;
            const currentTime = that.serverStartTime + elapsed;

            document.querySelectorAll('.time:not(.first-mess)[data-time]').forEach(timeEl => {
                let createdTime = new Date(timeEl.dataset.time * 1000);
                updateTime(timeEl, createdTime, currentTime);
            });
        };

        (async () => {
            setInterval(() => {
                const currentAccurateTime = getAccurateCurrentTime();
                if (currentAccurateTime) {
                    document.querySelectorAll('.time:not(.first-mess)[data-time]').forEach(timeEl => {
                        const createdTime = new Date(timeEl.dataset.time * 1000);
                        updateTime(timeEl, createdTime, currentAccurateTime);
                    });
                }
            }, 1000);
        })();
        this.lastMessageTime = new Date(res.botAnswer && res.botAnswer.createdTime ? res.botAnswer.createdTime * 1000 : currentServerTime);
        const lastMessageTime = this.lastMessageTime;
        setTimeout(() => {
            if (this.lastMessageTime === lastMessageTime) {
                that.addBotSingleMessage(that.endConvMsg);
            }
        }, this.msgInterval);
    }

    hasNumericKeys(obj) {
        for (const key in obj) {
            if (/^\d+$/.test(key)) {
                return true;
            }
        }
        return false;
    }

    isNestedObject(obj) {
        return Object.values(obj).some(value => typeof value === 'object' && !Array.isArray(value));
    }

    capitalizeFirstLetter(str) {
        return str[0].toUpperCase() + str.slice(1);
    }

    processNestedData(data, parentElement, index = 0) {
        let that = this;
        let entriedData = Object.entries(data);
        for (const [i, [key, val]] of entriedData.entries()) {
            if (key !== 'title' && key !== 'data' && !/^\d+$/.test(key)) {
                const camelCaseKey = that.toCamelCase(`${index}-${i}-arr`);
                if (typeof val === 'object' && !Array.isArray(val)) {
                    parentElement.dataset[camelCaseKey] = JSON.stringify(val);
                    that.processNestedData(val, parentElement, `${index}-${i}-arr`);
                } else if (Array.isArray(val)) {
                    parentElement.dataset[camelCaseKey] = JSON.stringify(val);
                } else {
                    parentElement.dataset[camelCaseKey] = val;
                }
            }
        }
    }

    toCamelCase(str) {
        return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    }

    extractDataAttr(array) {
        return array.map(item => item.title);
    }

    trimBrTags(selector) {
        if (selector) {
            selector[0].innerHTML = selector[0].innerHTML.replace(/^(<br\s*\/?>|\s|&nbsp;)+/, '').replace(/(<br\s*\/?>|\s|&nbsp;)+$/, '');
        }
    }

    handleQuestDetail(el) {
        let that = this;
        let detailVal = {
            title: el.dataset.title,
            content: el.dataset.content,
            botFullName: el.dataset.botFullName,
            fullName: el.dataset.fullName,
            subData: that.getDatasetEndWithArr(el)
        };
        if (el.classList.contains('sub-data')) {
            let contentArr = JSON.parse(el.dataset.contentArr);
            delete contentArr.title;
            delete contentArr.data;
            detailVal.nestedArr = '1';
            detailVal.subData = contentArr;
        }
        that.addMessage({}, '', true, detailVal);
    }

    getDatasetEndWithArr(el) {
        const datasets = {};
        for (const [key, value] of Object.entries(el.dataset)) {
            if (key.endsWith('Arr')) {
                datasets[key] = value;
            }
        }
        return datasets;
    }

    getDay() {
        let currentDay = new Date().toLocaleString('en-us', { weekday: 'long' });
        switch (currentDay) {
            case 'Monday': currentDay = 'Thứ hai'; break;
            case 'Tuesday': currentDay = 'Thứ ba'; break;
            case 'Wednesday': currentDay = 'Thứ tư'; break;
            case 'Thursday': currentDay = 'Thứ năm'; break;
            case 'Friday': currentDay = 'Thứ sáu'; break;
            case 'Saturday': currentDay = 'Thứ bảy'; break;
            case 'Sunday': currentDay = 'Chủ nhật'; break;
        }
        return currentDay;
    }

    resizeTextArea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    closeWindow() {
        document.querySelector('.window-chatbot').style.display = 'none';
        document.querySelector('.chatGPT-icon').style.display = 'block';
    }

    fullScreen() {
        let chatWindow = document.querySelector('.window-chatbot'),
            fullBtn = document.querySelector('.full-window');
        if (!chatWindow.classList.contains('full-screen')) {
            chatWindow.classList.add('full-screen');
            fullBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.800 2.245 C 20.691 2.277,20.012 2.933,17.710 5.232 L 14.760 8.179 14.758 6.079 C 14.757 4.925,14.741 3.902,14.723 3.806 C 14.653 3.443,14.418 3.268,14.000 3.268 C 13.582 3.268,13.347 3.444,13.278 3.806 C 13.259 3.902,13.243 5.380,13.240 7.091 L 13.235 10.203 13.328 10.370 C 13.429 10.552,13.621 10.702,13.815 10.750 C 13.884 10.766,15.362 10.771,17.100 10.760 C 20.169 10.741,20.264 10.738,20.396 10.660 C 20.669 10.499,20.792 10.182,20.723 9.815 C 20.682 9.596,20.581 9.449,20.396 9.340 C 20.265 9.263,20.177 9.260,18.043 9.248 L 15.825 9.236 18.769 6.288 C 21.399 3.655,21.718 3.322,21.759 3.169 C 21.893 2.658,21.312 2.097,20.800 2.245 M6.840 13.238 C 3.833 13.259,3.736 13.262,3.604 13.340 C 3.419 13.449,3.318 13.596,3.277 13.815 C 3.208 14.182,3.331 14.499,3.604 14.660 C 3.735 14.737,3.823 14.740,5.957 14.752 L 8.175 14.764 5.231 17.712 C 1.996 20.951,2.139 20.785,2.241 21.165 C 2.301 21.386,2.614 21.699,2.835 21.759 C 3.215 21.861,3.049 22.004,6.288 18.769 L 9.236 15.825 9.248 18.043 C 9.260 20.177,9.263 20.265,9.340 20.396 C 9.501 20.669,9.818 20.792,10.185 20.723 C 10.404 20.682,10.551 20.581,10.660 20.396 C 10.738 20.264,10.741 20.169,10.760 17.100 C 10.771 15.362,10.766 13.884,10.750 13.815 C 10.677 13.518,10.386 13.264,10.080 13.231 C 10.003 13.223,8.545 13.226,6.840 13.238 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>';
        } else {
            chatWindow.classList.remove('full-screen');
            fullBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.840 2.238 C 14.833 2.259,14.736 2.262,14.604 2.340 C 14.419 2.449,14.318 2.596,14.277 2.815 C 14.208 3.182,14.331 3.499,14.604 3.660 C 14.735 3.737,14.823 3.740,16.957 3.752 L 19.175 3.764 16.231 6.712 C 12.996 9.951,13.139 9.785,13.241 10.165 C 13.301 10.386,13.614 10.699,13.835 10.759 C 14.215 10.861,14.049 11.004,17.288 7.769 L 20.236 4.825 20.248 7.043 C 20.260 9.177,20.263 9.265,20.340 9.396 C 20.449 9.581,20.596 9.682,20.815 9.723 C 21.182 9.792,21.499 9.669,21.660 9.396 C 21.738 9.264,21.741 9.169,21.760 6.100 C 21.771 4.362,21.766 2.884,21.750 2.815 C 21.677 2.518,21.386 2.264,21.080 2.231 C 21.003 2.223,19.545 2.226,17.840 2.238 M9.800 13.245 C 9.691 13.277,9.012 13.933,6.710 16.232 L 3.760 19.179 3.758 17.079 C 3.757 15.925,3.741 14.902,3.723 14.806 C 3.653 14.443,3.418 14.268,3.000 14.268 C 2.582 14.268,2.347 14.444,2.278 14.806 C 2.259 14.902,2.243 16.380,2.240 18.091 L 2.235 21.203 2.328 21.370 C 2.429 21.552,2.621 21.702,2.815 21.750 C 2.884 21.766,4.362 21.771,6.100 21.760 C 9.169 21.741,9.264 21.738,9.396 21.660 C 9.581 21.551,9.682 21.404,9.723 21.185 C 9.792 20.818,9.669 20.501,9.396 20.340 C 9.265 20.263,9.177 20.260,7.043 20.248 L 4.825 20.236 7.769 17.288 C 10.399 14.655,10.718 14.322,10.759 14.169 C 10.893 13.658,10.312 13.097,9.800 13.245 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>';
        }
    }
}


