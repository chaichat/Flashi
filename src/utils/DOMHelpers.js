class DOMHelpers {
    static getElementById(id) {
        return document.getElementById(id);
    }

    static querySelector(selector) {
        return document.querySelector(selector);
    }

    static querySelectorAll(selector) {
        return document.querySelectorAll(selector);
    }

    static createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    static show(element) {
        if (element) element.classList.remove('hidden');
    }

    static hide(element) {
        if (element) element.classList.add('hidden');
    }

    static toggle(element, condition) {
        if (element) {
            if (condition) {
                this.show(element);
            } else {
                this.hide(element);
            }
        }
    }

    static addClass(element, className) {
        if (element) element.classList.add(className);
    }

    static removeClass(element, className) {
        if (element) element.classList.remove(className);
    }

    static toggleClass(element, className, condition) {
        if (element) element.classList.toggle(className, condition);
    }

    static clearContent(element) {
        if (element) element.innerHTML = '';
    }

    static setContent(element, content) {
        if (element) element.innerHTML = content;
    }

    static setText(element, text) {
        if (element) element.textContent = text;
    }

    static addEventListener(element, event, handler, options = {}) {
        if (element) {
            element.addEventListener(event, handler, options);
        }
    }

    static removeEventListener(element, event, handler) {
        if (element) {
            element.removeEventListener(event, handler);
        }
    }

    static appendChildren(parent, ...children) {
        if (parent) {
            children.forEach(child => {
                if (child) parent.appendChild(child);
            });
        }
    }

    static replaceContent(parent, ...newChildren) {
        if (parent) {
            this.clearContent(parent);
            this.appendChildren(parent, ...newChildren);
        }
    }

    static setAttributes(element, attributes) {
        if (element && attributes) {
            Object.keys(attributes).forEach(key => {
                element.setAttribute(key, attributes[key]);
            });
        }
    }

    static setStyles(element, styles) {
        if (element && styles) {
            Object.keys(styles).forEach(key => {
                element.style[key] = styles[key];
            });
        }
    }

    static fadeIn(element, duration = 300) {
        if (element) {
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease`;
            this.show(element);
            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });
        }
    }

    static fadeOut(element, duration = 300, callback) {
        if (element) {
            element.style.opacity = '1';
            element.style.transition = `opacity ${duration}ms ease`;
            element.style.opacity = '0';
            setTimeout(() => {
                this.hide(element);
                if (callback) callback();
            }, duration);
        }
    }

    static isVisible(element) {
        return element && !element.classList.contains('hidden');
    }
}

export default DOMHelpers;