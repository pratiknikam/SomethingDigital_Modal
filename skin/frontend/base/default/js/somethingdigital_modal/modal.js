var SomethingDigital_Modal = Class.create();
SomethingDigital_Modal.prototype = {
    initialize: function(config) {
        this.setupOptions(config);
        this.updatePageViewCookie()
        if (this.shouldShowModal()) {
            this.cookieUser();
            this.showModal();
            this.setupModalClose();
            this.setupFormAjax();
        }
    },
    setupOptions: function(config) {
        this.options = config;
        this.options.seenModalFlag = 'seenModal';
        this.options.pageViewCountCookieName = 'pagesViewed';
        this.options.modalElementId = 'modal';
        this.options.closeModalElementClass = 'close-modal';
        this.options.modalFormElementId = 'modal-form';
        this.options.beforeWrapperElementId = 'modal-before';
        this.options.afterWrapperElementId = 'modal-after';
        this.options.loadingElementId = 'modal-loading';
        this.options.errorMessageElementId = 'modal-error';
        this.options.forceModalQueryStringParam = 'forceModal';
    },
    updatePageViewCookie: function() {
        var curCount = Mage.Cookies.get(this.options.pageViewCountCookieName);
        if (!curCount) {
            Mage.Cookies.set(this.options.pageViewCountCookieName, 0);
            return;
        }
        Mage.Cookies.set(this.options.pageViewCountCookieName, parseInt(curCount) + 1);
    },
    shouldShowModal: function() {
        var forceQuery = this.options.forceModalQueryStringParam,
            urlParams = window.location.href.toQueryParams();
        if (this.options.skipCookieCheck || urlParams.hasOwnProperty(forceQuery)) {
            return true;
        }
        if (!Mage.Cookies.get(this.options.seenModalFlag) && 
            parseInt(Mage.Cookies.get(this.options.pageViewCountCookieName)) >= this.options.showAfterPageViews) {
            return true;
        }
        return false;
    },
    cookieUser: function() {
        var today = new Date();
        today.setTime(today.getTime());
        var duration = 1000 * 60 * 60 * 24 * this.options.cookieDuration;
        var expireDate = new Date(today.getTime() + duration);
        Mage.Cookies.expires = expireDate;
        Mage.Cookies.set(this.options.seenModalFlag, 1);   
    },
    showModal: function() {
        this.modal = new Window({
            width: window.innerWidth,
            height: window.innerHeight,
            zIndex: this.options.modalZIndex,
            onShow: this.showOverlay.bind(this),
            onHide: this.removeOverlay.bind(this),
            onClose: this.removeOverlay.bind(this)
        });
        this.modal.getContent().update(this.options.modalContent);
        this.modal.showCenter();
    },
    setupModalClose: function() {
        Element.observe(this.options.modalElementId, 'click', this.handleModalClick.bind(this));
        if (this.options.closeOnOutsideClicks) {
            document.observe('click', this.handleDocumentClick.bind(this));
        }
    },
    setupFormAjax: function() {
        Event.observe($(this.options.modalFormElementId), 'submit', function(event) {
            Event.stop(event);
            Form.request(this.options.modalFormElementId, {
                onLoading: $(this.options.loadingElementId).show(),
                onFailure: this.onFailure.bind(this),
                onSuccess: this.onSuccess.bind(this)
            })
        }.bind(this))
    },
    onFailure: function(response) {
        $(this.options.loadingElementId).hide();
        $(this.options.errorMessageElementId).update(this.options.errorMessage).show();
    },
    onSuccess: function(response) {
        $(this.options.beforeWrapperElementId).hide();
        $(this.options.afterWrapperElementId).show();
        var s = parseInt(this.options.closeAfterSeconds) * 1000;
        if (s) {
            window.setTimeout(this.closeModal.bind(this), s);
        }
    },
    handleModalClick: function(event) {
        if (event.findElement('.' + this.options.closeModalElementClass)) {
           this.closeModal();
        }
    },
    showOverlay: function() {
        var overlayStyle = 'width: 100%; height: 100%; background-color: black; opacity: ' + this.options.overlayOpacity + '; z-index: ' + (parseInt(this.options.modalZIndex) - 1) + '; position: absolute; top: 0; left: 0';
        this.overlay = new Element('div', {style: overlayStyle, 'id': 'overlay'});
        $$('body')[0].insert(this.overlay);
    },
    removeOverlay: function() {
        this.overlay.remove();
    },
    handleDocumentClick: function(event) {
        if (!event.findElement('#' + this.options.modalElementId)) {
            this.closeModal();
        }
    },
    closeModal: function() {
        this.modal.close();
    }
}
