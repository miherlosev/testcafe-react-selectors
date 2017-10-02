/*global window*/
/*eslint-disable no-unused-vars*/
function getReact15 (node, fn) {
/*eslint-enable no-unused-vars*/
    const utils = window['%testCafeReactSelectorUtils%'];

    function copyReactObject (obj) {
        var copiedObj = {};

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop) && prop !== 'children')
                copiedObj[prop] = obj[prop];
        }

        return copiedObj;
    }

    function getComponentInstance (component) {
        const parent               = component._hostParent || component;
        const renderedChildren     = parent._renderedChildren || { _: component._renderedComponent } || {};
        const renderedChildrenKeys = Object.keys(renderedChildren);
        const componentName        = window['%testCafeReactSelector%'];

        for (let index = 0; index < renderedChildrenKeys.length; ++index) {
            const key             = renderedChildrenKeys[index];
            let renderedComponent = renderedChildren[key];
            let componentInstance = null;

            while (renderedComponent) {
                if (componentName === utils.getName(renderedComponent))
                    componentInstance = renderedComponent._instance;

                if (renderedComponent._domID === component._domID)
                    return componentInstance;

                renderedComponent = renderedComponent._renderedComponent;
            }
        }

        return null;
    }

    function getComponentForDOMNode (el) {
        if (!el || !(el.nodeType === 1 || el.nodeType === 8))
            return null;

        const isRootNode    = el.hasAttribute && el.hasAttribute('data-reactroot');
        const componentName = window['%testCafeReactSelector%'];

        if (isRootNode) {
            const rootComponent = utils.getRootComponent(el);

            //NOTE: check if it's not a portal component
            if (utils.getName(rootComponent) === componentName)
                return rootComponent._instance;

            return getComponentInstance(rootComponent);
        }

        for (var prop of Object.keys(el)) {
            if (!/^__reactInternalInstance/.test(prop))
                continue;

            return getComponentInstance(el[prop]);
        }
    }

    var componentInstance = getComponentForDOMNode(node);

    if (!componentInstance) return null;

    delete window['%testCafeReactSelector%'];

    if (typeof fn === 'function') {
        return fn({
            state: copyReactObject(componentInstance.state),
            props: copyReactObject(componentInstance.props)
        });
    }

    return {
        state: copyReactObject(componentInstance.state),
        props: copyReactObject(componentInstance.props)
    };
}