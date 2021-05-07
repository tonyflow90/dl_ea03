
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* node_modules\smelte\src\components\Icon\Icon.svelte generated by Svelte v3.37.0 */

    const file$k = "node_modules\\smelte\\src\\components\\Icon\\Icon.svelte";

    function create_fragment$m(ctx) {
    	let i;
    	let i_class_value;
    	let i_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			i = element("i");
    			if (default_slot) default_slot.c();
    			attr_dev(i, "aria-hidden", "true");
    			attr_dev(i, "class", i_class_value = "material-icons icon text-xl select-none " + /*$$props*/ ctx[5].class + " duration-200 ease-in" + " svelte-zzky5a");
    			attr_dev(i, "style", i_style_value = /*color*/ ctx[4] ? `color: ${/*color*/ ctx[4]}` : "");
    			toggle_class(i, "reverse", /*reverse*/ ctx[2]);
    			toggle_class(i, "tip", /*tip*/ ctx[3]);
    			toggle_class(i, "text-base", /*small*/ ctx[0]);
    			toggle_class(i, "text-xs", /*xs*/ ctx[1]);
    			add_location(i, file$k, 20, 0, 273);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (default_slot) {
    				default_slot.m(i, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 32 && i_class_value !== (i_class_value = "material-icons icon text-xl select-none " + /*$$props*/ ctx[5].class + " duration-200 ease-in" + " svelte-zzky5a")) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (!current || dirty & /*color*/ 16 && i_style_value !== (i_style_value = /*color*/ ctx[4] ? `color: ${/*color*/ ctx[4]}` : "")) {
    				attr_dev(i, "style", i_style_value);
    			}

    			if (dirty & /*$$props, reverse*/ 36) {
    				toggle_class(i, "reverse", /*reverse*/ ctx[2]);
    			}

    			if (dirty & /*$$props, tip*/ 40) {
    				toggle_class(i, "tip", /*tip*/ ctx[3]);
    			}

    			if (dirty & /*$$props, small*/ 33) {
    				toggle_class(i, "text-base", /*small*/ ctx[0]);
    			}

    			if (dirty & /*$$props, xs*/ 34) {
    				toggle_class(i, "text-xs", /*xs*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icon", slots, ['default']);
    	let { small = false } = $$props;
    	let { xs = false } = $$props;
    	let { reverse = false } = $$props;
    	let { tip = false } = $$props;
    	let { color = "default" } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("small" in $$new_props) $$invalidate(0, small = $$new_props.small);
    		if ("xs" in $$new_props) $$invalidate(1, xs = $$new_props.xs);
    		if ("reverse" in $$new_props) $$invalidate(2, reverse = $$new_props.reverse);
    		if ("tip" in $$new_props) $$invalidate(3, tip = $$new_props.tip);
    		if ("color" in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ("$$scope" in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ small, xs, reverse, tip, color });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ("small" in $$props) $$invalidate(0, small = $$new_props.small);
    		if ("xs" in $$props) $$invalidate(1, xs = $$new_props.xs);
    		if ("reverse" in $$props) $$invalidate(2, reverse = $$new_props.reverse);
    		if ("tip" in $$props) $$invalidate(3, tip = $$new_props.tip);
    		if ("color" in $$props) $$invalidate(4, color = $$new_props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [small, xs, reverse, tip, color, $$props, $$scope, slots, click_handler];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
    			small: 0,
    			xs: 1,
    			reverse: 2,
    			tip: 3,
    			color: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get small() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xs() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xs(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reverse() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverse(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tip() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tip(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const noDepth = ["white", "black", "transparent"];

    function getClass(prop, color, depth, defaultDepth) {
      if (noDepth.includes(color)) {
        return `${prop}-${color}`;
      }
      return `${prop}-${color}-${depth || defaultDepth} `;
    }

    function utils(color, defaultDepth = 500) {
      return {
        bg: depth => getClass("bg", color, depth, defaultDepth),
        border: depth => getClass("border", color, depth, defaultDepth),
        txt: depth => getClass("text", color, depth, defaultDepth),
        caret: depth => getClass("caret", color, depth, defaultDepth)
      };
    }

    class ClassBuilder {
      constructor(classes, defaultClasses) {
        this.defaults =
          (typeof classes === "function" ? classes(defaultClasses) : classes) ||
          defaultClasses;

        this.classes = this.defaults;
      }

      flush() {
        this.classes = this.defaults;

        return this;
      }

      extend(...fns) {
        return this;
      }

      get() {
        return this.classes;
      }

      replace(classes, cond = true) {
        if (cond && classes) {
          this.classes = Object.keys(classes).reduce(
            (acc, from) => acc.replace(new RegExp(from, "g"), classes[from]),
            this.classes
          );
        }

        return this;
      }

      remove(classes, cond = true) {
        if (cond && classes) {
          this.classes = classes
            .split(" ")
            .reduce(
              (acc, cur) => acc.replace(new RegExp(cur, "g"), ""),
              this.classes
            );
        }

        return this;
      }

      add(className, cond = true, defaultValue) {
        if (!cond || !className) return this;

        switch (typeof className) {
          case "string":
          default:
            this.classes += ` ${className} `;
            return this;
          case "function":
            this.classes += ` ${className(defaultValue || this.classes)} `;
            return this;
        }
      }
    }

    const defaultReserved = ["class", "add", "remove", "replace", "value"];

    function filterProps(reserved, props) {
      const r = [...reserved, ...defaultReserved];

      return Object.keys(props).reduce(
        (acc, cur) =>
          cur.includes("$$") || cur.includes("Class") || r.includes(cur)
            ? acc
            : { ...acc, [cur]: props[cur] },
        {}
      );
    }

    // Thanks Lagden! https://svelte.dev/repl/61d9178d2b9944f2aa2bfe31612ab09f?version=3.6.7
    function ripple(color, centered) {
      return function(event) {
        const target = event.currentTarget;
        const circle = document.createElement("span");
        const d = Math.max(target.clientWidth, target.clientHeight);

        const removeCircle = () => {
          circle.remove();
          circle.removeEventListener("animationend", removeCircle);
        };

        circle.addEventListener("animationend", removeCircle);
        circle.style.width = circle.style.height = `${d}px`;
        const rect = target.getBoundingClientRect();

        if (centered) {
          circle.classList.add(
            "absolute",
            "top-0",
            "left-0",
            "ripple-centered",
            `bg-${color}-transDark`
          );
        } else {
          circle.style.left = `${event.clientX - rect.left - d / 2}px`;
          circle.style.top = `${event.clientY - rect.top - d / 2}px`;

          circle.classList.add("ripple-normal", `bg-${color}-trans`);
        }

        circle.classList.add("ripple");

        target.appendChild(circle);
      };
    }

    function r(color = "primary", centered = false) {
      return function(node) {
        const onMouseDown = ripple(color, centered);
        node.addEventListener("mousedown", onMouseDown);

        return {
          onDestroy: () => node.removeEventListener("mousedown", onMouseDown),
        };
      };
    }

    /* node_modules\smelte\src\components\Button\Button.svelte generated by Svelte v3.37.0 */
    const file$j = "node_modules\\smelte\\src\\components\\Button\\Button.svelte";

    // (153:0) {:else}
    function create_else_block$3(ctx) {
    	let button;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*icon*/ ctx[3] && create_if_block_2$2(ctx);
    	const default_slot_template = /*#slots*/ ctx[34].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[43], null);

    	let button_levels = [
    		{ class: /*classes*/ ctx[1] },
    		/*props*/ ctx[9],
    		{ type: /*type*/ ctx[6] },
    		{ disabled: /*disabled*/ ctx[2] }
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			add_location(button, file$j, 153, 2, 4075);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*ripple*/ ctx[8].call(null, button)),
    					listen_dev(button, "click", /*click_handler_3*/ ctx[42], false, false, false),
    					listen_dev(button, "click", /*click_handler_1*/ ctx[38], false, false, false),
    					listen_dev(button, "mouseover", /*mouseover_handler_1*/ ctx[39], false, false, false),
    					listen_dev(button, "*", /*_handler_1*/ ctx[40], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*icon*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*icon*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(button, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[43], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty[0] & /*classes*/ 2) && { class: /*classes*/ ctx[1] },
    				/*props*/ ctx[9],
    				(!current || dirty[0] & /*type*/ 64) && { type: /*type*/ ctx[6] },
    				(!current || dirty[0] & /*disabled*/ 4) && { disabled: /*disabled*/ ctx[2] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(153:0) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (131:0) {#if href}
    function create_if_block$8(ctx) {
    	let a;
    	let button;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*icon*/ ctx[3] && create_if_block_1$4(ctx);
    	const default_slot_template = /*#slots*/ ctx[34].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[43], null);

    	let button_levels = [
    		{ class: /*classes*/ ctx[1] },
    		/*props*/ ctx[9],
    		{ type: /*type*/ ctx[6] },
    		{ disabled: /*disabled*/ ctx[2] }
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	let a_levels = [{ href: /*href*/ ctx[5] }, /*props*/ ctx[9]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			a = element("a");
    			button = element("button");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			add_location(button, file$j, 135, 4, 3762);
    			set_attributes(a, a_data);
    			add_location(a, file$j, 131, 2, 3725);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, button);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*ripple*/ ctx[8].call(null, button)),
    					listen_dev(button, "click", /*click_handler_2*/ ctx[41], false, false, false),
    					listen_dev(button, "click", /*click_handler*/ ctx[35], false, false, false),
    					listen_dev(button, "mouseover", /*mouseover_handler*/ ctx[36], false, false, false),
    					listen_dev(button, "*", /*_handler*/ ctx[37], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*icon*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*icon*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(button, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[43], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty[0] & /*classes*/ 2) && { class: /*classes*/ ctx[1] },
    				/*props*/ ctx[9],
    				(!current || dirty[0] & /*type*/ 64) && { type: /*type*/ ctx[6] },
    				(!current || dirty[0] & /*disabled*/ 4) && { disabled: /*disabled*/ ctx[2] }
    			]));

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty[0] & /*href*/ 32) && { href: /*href*/ ctx[5] },
    				/*props*/ ctx[9]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(131:0) {#if href}",
    		ctx
    	});

    	return block_1;
    }

    // (165:4) {#if icon}
    function create_if_block_2$2(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				class: /*iClasses*/ ctx[7],
    				small: /*small*/ ctx[4],
    				$$slots: { default: [create_default_slot_1$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block_1 = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty[0] & /*iClasses*/ 128) icon_1_changes.class = /*iClasses*/ ctx[7];
    			if (dirty[0] & /*small*/ 16) icon_1_changes.small = /*small*/ ctx[4];

    			if (dirty[0] & /*icon*/ 8 | dirty[1] & /*$$scope*/ 4096) {
    				icon_1_changes.$$scope = { dirty, ctx };
    			}

    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(165:4) {#if icon}",
    		ctx
    	});

    	return block_1;
    }

    // (166:6) <Icon class={iClasses} {small}>
    function create_default_slot_1$5(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*icon*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*icon*/ 8) set_data_dev(t, /*icon*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_default_slot_1$5.name,
    		type: "slot",
    		source: "(166:6) <Icon class={iClasses} {small}>",
    		ctx
    	});

    	return block_1;
    }

    // (147:6) {#if icon}
    function create_if_block_1$4(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				class: /*iClasses*/ ctx[7],
    				small: /*small*/ ctx[4],
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block_1 = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty[0] & /*iClasses*/ 128) icon_1_changes.class = /*iClasses*/ ctx[7];
    			if (dirty[0] & /*small*/ 16) icon_1_changes.small = /*small*/ ctx[4];

    			if (dirty[0] & /*icon*/ 8 | dirty[1] & /*$$scope*/ 4096) {
    				icon_1_changes.$$scope = { dirty, ctx };
    			}

    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(147:6) {#if icon}",
    		ctx
    	});

    	return block_1;
    }

    // (148:8) <Icon class={iClasses} {small}>
    function create_default_slot$8(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*icon*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*icon*/ 8) set_data_dev(t, /*icon*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(148:8) <Icon class={iClasses} {small}>",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$l(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$8, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    const classesDefault$9 = "z-10 py-2 px-4 uppercase text-sm font-medium relative overflow-hidden";
    const basicDefault = "text-white duration-200 ease-in";
    const outlinedDefault = "bg-transparent border border-solid";
    const textDefault = "bg-transparent border-none px-4 hover:bg-transparent";
    const iconDefault = "p-4 flex items-center select-none";
    const fabDefault = "hover:bg-transparent";
    const smallDefault = "pt-1 pb-1 pl-2 pr-2 text-xs";
    const disabledDefault = "bg-gray-300 text-gray-500 dark:bg-dark-400 pointer-events-none hover:bg-gray-300 cursor-default";
    const elevationDefault = "hover:shadow shadow";

    function instance$l($$self, $$props, $$invalidate) {
    	let normal;
    	let lighter;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { value = false } = $$props;
    	let { outlined = false } = $$props;
    	let { text = false } = $$props;
    	let { block = false } = $$props;
    	let { disabled = false } = $$props;
    	let { icon = null } = $$props;
    	let { small = false } = $$props;
    	let { light = false } = $$props;
    	let { dark = false } = $$props;
    	let { flat = false } = $$props;
    	let { iconClass = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { href = null } = $$props;
    	let { fab = false } = $$props;
    	let { type = "button" } = $$props;
    	let { remove = "" } = $$props;
    	let { add = "" } = $$props;
    	let { replace = {} } = $$props;
    	let { classes = classesDefault$9 } = $$props;
    	let { basicClasses = basicDefault } = $$props;
    	let { outlinedClasses = outlinedDefault } = $$props;
    	let { textClasses = textDefault } = $$props;
    	let { iconClasses = iconDefault } = $$props;
    	let { fabClasses = fabDefault } = $$props;
    	let { smallClasses = smallDefault } = $$props;
    	let { disabledClasses = disabledDefault } = $$props;
    	let { elevationClasses = elevationDefault } = $$props;
    	fab = fab || text && icon;
    	const basic = !outlined && !text && !fab;
    	const elevation = (basic || icon) && !disabled && !flat && !text;
    	let Classes = i => i;
    	let iClasses = i => i;
    	let shade = 0;
    	const { bg, border, txt } = utils(color);
    	const cb = new ClassBuilder(classes, classesDefault$9);
    	let iconCb;

    	if (icon) {
    		iconCb = new ClassBuilder(iconClass);
    	}

    	const ripple = r(text || fab || outlined ? color : "white");

    	const props = filterProps(
    		[
    			"outlined",
    			"text",
    			"color",
    			"block",
    			"disabled",
    			"icon",
    			"small",
    			"light",
    			"dark",
    			"flat",
    			"add",
    			"remove",
    			"replace"
    		],
    		$$props
    	);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function _handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler_1(event) {
    		bubble($$self, event);
    	}

    	function _handler_1(event) {
    		bubble($$self, event);
    	}

    	const click_handler_2 = () => $$invalidate(0, value = !value);
    	const click_handler_3 = () => $$invalidate(0, value = !value);

    	$$self.$$set = $$new_props => {
    		$$invalidate(51, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("outlined" in $$new_props) $$invalidate(11, outlined = $$new_props.outlined);
    		if ("text" in $$new_props) $$invalidate(12, text = $$new_props.text);
    		if ("block" in $$new_props) $$invalidate(13, block = $$new_props.block);
    		if ("disabled" in $$new_props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("icon" in $$new_props) $$invalidate(3, icon = $$new_props.icon);
    		if ("small" in $$new_props) $$invalidate(4, small = $$new_props.small);
    		if ("light" in $$new_props) $$invalidate(14, light = $$new_props.light);
    		if ("dark" in $$new_props) $$invalidate(15, dark = $$new_props.dark);
    		if ("flat" in $$new_props) $$invalidate(16, flat = $$new_props.flat);
    		if ("iconClass" in $$new_props) $$invalidate(17, iconClass = $$new_props.iconClass);
    		if ("color" in $$new_props) $$invalidate(18, color = $$new_props.color);
    		if ("href" in $$new_props) $$invalidate(5, href = $$new_props.href);
    		if ("fab" in $$new_props) $$invalidate(10, fab = $$new_props.fab);
    		if ("type" in $$new_props) $$invalidate(6, type = $$new_props.type);
    		if ("remove" in $$new_props) $$invalidate(19, remove = $$new_props.remove);
    		if ("add" in $$new_props) $$invalidate(20, add = $$new_props.add);
    		if ("replace" in $$new_props) $$invalidate(21, replace = $$new_props.replace);
    		if ("classes" in $$new_props) $$invalidate(1, classes = $$new_props.classes);
    		if ("basicClasses" in $$new_props) $$invalidate(22, basicClasses = $$new_props.basicClasses);
    		if ("outlinedClasses" in $$new_props) $$invalidate(23, outlinedClasses = $$new_props.outlinedClasses);
    		if ("textClasses" in $$new_props) $$invalidate(24, textClasses = $$new_props.textClasses);
    		if ("iconClasses" in $$new_props) $$invalidate(25, iconClasses = $$new_props.iconClasses);
    		if ("fabClasses" in $$new_props) $$invalidate(26, fabClasses = $$new_props.fabClasses);
    		if ("smallClasses" in $$new_props) $$invalidate(27, smallClasses = $$new_props.smallClasses);
    		if ("disabledClasses" in $$new_props) $$invalidate(28, disabledClasses = $$new_props.disabledClasses);
    		if ("elevationClasses" in $$new_props) $$invalidate(29, elevationClasses = $$new_props.elevationClasses);
    		if ("$$scope" in $$new_props) $$invalidate(43, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Icon,
    		utils,
    		ClassBuilder,
    		filterProps,
    		createRipple: r,
    		value,
    		outlined,
    		text,
    		block,
    		disabled,
    		icon,
    		small,
    		light,
    		dark,
    		flat,
    		iconClass,
    		color,
    		href,
    		fab,
    		type,
    		remove,
    		add,
    		replace,
    		classesDefault: classesDefault$9,
    		basicDefault,
    		outlinedDefault,
    		textDefault,
    		iconDefault,
    		fabDefault,
    		smallDefault,
    		disabledDefault,
    		elevationDefault,
    		classes,
    		basicClasses,
    		outlinedClasses,
    		textClasses,
    		iconClasses,
    		fabClasses,
    		smallClasses,
    		disabledClasses,
    		elevationClasses,
    		basic,
    		elevation,
    		Classes,
    		iClasses,
    		shade,
    		bg,
    		border,
    		txt,
    		cb,
    		iconCb,
    		ripple,
    		props,
    		normal,
    		lighter
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(51, $$props = assign(assign({}, $$props), $$new_props));
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("outlined" in $$props) $$invalidate(11, outlined = $$new_props.outlined);
    		if ("text" in $$props) $$invalidate(12, text = $$new_props.text);
    		if ("block" in $$props) $$invalidate(13, block = $$new_props.block);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("icon" in $$props) $$invalidate(3, icon = $$new_props.icon);
    		if ("small" in $$props) $$invalidate(4, small = $$new_props.small);
    		if ("light" in $$props) $$invalidate(14, light = $$new_props.light);
    		if ("dark" in $$props) $$invalidate(15, dark = $$new_props.dark);
    		if ("flat" in $$props) $$invalidate(16, flat = $$new_props.flat);
    		if ("iconClass" in $$props) $$invalidate(17, iconClass = $$new_props.iconClass);
    		if ("color" in $$props) $$invalidate(18, color = $$new_props.color);
    		if ("href" in $$props) $$invalidate(5, href = $$new_props.href);
    		if ("fab" in $$props) $$invalidate(10, fab = $$new_props.fab);
    		if ("type" in $$props) $$invalidate(6, type = $$new_props.type);
    		if ("remove" in $$props) $$invalidate(19, remove = $$new_props.remove);
    		if ("add" in $$props) $$invalidate(20, add = $$new_props.add);
    		if ("replace" in $$props) $$invalidate(21, replace = $$new_props.replace);
    		if ("classes" in $$props) $$invalidate(1, classes = $$new_props.classes);
    		if ("basicClasses" in $$props) $$invalidate(22, basicClasses = $$new_props.basicClasses);
    		if ("outlinedClasses" in $$props) $$invalidate(23, outlinedClasses = $$new_props.outlinedClasses);
    		if ("textClasses" in $$props) $$invalidate(24, textClasses = $$new_props.textClasses);
    		if ("iconClasses" in $$props) $$invalidate(25, iconClasses = $$new_props.iconClasses);
    		if ("fabClasses" in $$props) $$invalidate(26, fabClasses = $$new_props.fabClasses);
    		if ("smallClasses" in $$props) $$invalidate(27, smallClasses = $$new_props.smallClasses);
    		if ("disabledClasses" in $$props) $$invalidate(28, disabledClasses = $$new_props.disabledClasses);
    		if ("elevationClasses" in $$props) $$invalidate(29, elevationClasses = $$new_props.elevationClasses);
    		if ("Classes" in $$props) Classes = $$new_props.Classes;
    		if ("iClasses" in $$props) $$invalidate(7, iClasses = $$new_props.iClasses);
    		if ("shade" in $$props) $$invalidate(30, shade = $$new_props.shade);
    		if ("iconCb" in $$props) $$invalidate(31, iconCb = $$new_props.iconCb);
    		if ("normal" in $$props) $$invalidate(32, normal = $$new_props.normal);
    		if ("lighter" in $$props) $$invalidate(33, lighter = $$new_props.lighter);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*light, dark, shade*/ 1073790976) {
    			{
    				$$invalidate(30, shade = light ? 200 : 0);
    				$$invalidate(30, shade = dark ? -400 : shade);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*shade*/ 1073741824) {
    			$$invalidate(32, normal = 500 - shade);
    		}

    		if ($$self.$$.dirty[0] & /*shade*/ 1073741824) {
    			$$invalidate(33, lighter = 400 - shade);
    		}

    		$$invalidate(1, classes = cb.flush().add(basicClasses, basic, basicDefault).add(`${bg(normal)} hover:${bg(lighter)}`, basic).add(elevationClasses, elevation, elevationDefault).add(outlinedClasses, outlined, outlinedDefault).add(`${border(lighter)} ${txt(normal)} hover:${bg("trans")} dark-hover:${bg("transDark")}`, outlined).add(`${txt(lighter)}`, text).add(textClasses, text, textDefault).add(iconClasses, icon, iconDefault).remove("py-2", icon).remove(txt(lighter), fab).add(disabledClasses, disabled, disabledDefault).add(smallClasses, small, smallDefault).add("flex items-center justify-center h-8 w-8", small && icon).add("border-solid", outlined).add("rounded-full", icon).add("w-full", block).add("rounded", basic || outlined || text).add("button", !icon).add(fabClasses, fab, fabDefault).add(`hover:${bg("transLight")}`, fab).add($$props.class).remove(remove).replace(replace).add(add).get());

    		if ($$self.$$.dirty[0] & /*fab, iconClass*/ 132096 | $$self.$$.dirty[1] & /*iconCb*/ 1) {
    			if (iconCb) {
    				$$invalidate(7, iClasses = iconCb.flush().add(txt(), fab && !iconClass).get());
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		classes,
    		disabled,
    		icon,
    		small,
    		href,
    		type,
    		iClasses,
    		ripple,
    		props,
    		fab,
    		outlined,
    		text,
    		block,
    		light,
    		dark,
    		flat,
    		iconClass,
    		color,
    		remove,
    		add,
    		replace,
    		basicClasses,
    		outlinedClasses,
    		textClasses,
    		iconClasses,
    		fabClasses,
    		smallClasses,
    		disabledClasses,
    		elevationClasses,
    		shade,
    		iconCb,
    		normal,
    		lighter,
    		slots,
    		click_handler,
    		mouseover_handler,
    		_handler,
    		click_handler_1,
    		mouseover_handler_1,
    		_handler_1,
    		click_handler_2,
    		click_handler_3,
    		$$scope
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$l,
    			create_fragment$l,
    			safe_not_equal,
    			{
    				value: 0,
    				outlined: 11,
    				text: 12,
    				block: 13,
    				disabled: 2,
    				icon: 3,
    				small: 4,
    				light: 14,
    				dark: 15,
    				flat: 16,
    				iconClass: 17,
    				color: 18,
    				href: 5,
    				fab: 10,
    				type: 6,
    				remove: 19,
    				add: 20,
    				replace: 21,
    				classes: 1,
    				basicClasses: 22,
    				outlinedClasses: 23,
    				textClasses: 24,
    				iconClasses: 25,
    				fabClasses: 26,
    				smallClasses: 27,
    				disabledClasses: 28,
    				elevationClasses: 29
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get value() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get light() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set light(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconClass() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconClass(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fab() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fab(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get basicClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basicClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlinedClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlinedClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fabClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fabClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get smallClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set smallClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabledClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabledClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get elevationClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set elevationClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\smelte\src\components\Card\Card.svelte generated by Svelte v3.37.0 */
    const file$i = "node_modules\\smelte\\src\\components\\Card\\Card.svelte";
    const get_actions_slot_changes = dirty => ({});
    const get_actions_slot_context = ctx => ({});
    const get_text_slot_changes = dirty => ({});
    const get_text_slot_context = ctx => ({});
    const get_media_slot_changes = dirty => ({});
    const get_media_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});

    function create_fragment$k(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;
    	const title_slot_template = /*#slots*/ ctx[4].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[3], get_title_slot_context);
    	const media_slot_template = /*#slots*/ ctx[4].media;
    	const media_slot = create_slot(media_slot_template, ctx, /*$$scope*/ ctx[3], get_media_slot_context);
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	const text_slot_template = /*#slots*/ ctx[4].text;
    	const text_slot = create_slot(text_slot_template, ctx, /*$$scope*/ ctx[3], get_text_slot_context);
    	const actions_slot_template = /*#slots*/ ctx[4].actions;
    	const actions_slot = create_slot(actions_slot_template, ctx, /*$$scope*/ ctx[3], get_actions_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (title_slot) title_slot.c();
    			t0 = space();
    			if (media_slot) media_slot.c();
    			t1 = space();
    			if (default_slot) default_slot.c();
    			t2 = space();
    			if (text_slot) text_slot.c();
    			t3 = space();
    			if (actions_slot) actions_slot.c();
    			attr_dev(div, "class", /*c*/ ctx[0]);
    			add_location(div, file$i, 18, 0, 440);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (title_slot) {
    				title_slot.m(div, null);
    			}

    			append_dev(div, t0);

    			if (media_slot) {
    				media_slot.m(div, null);
    			}

    			append_dev(div, t1);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(div, t2);

    			if (text_slot) {
    				text_slot.m(div, null);
    			}

    			append_dev(div, t3);

    			if (actions_slot) {
    				actions_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (title_slot) {
    				if (title_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(title_slot, title_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_title_slot_changes, get_title_slot_context);
    				}
    			}

    			if (media_slot) {
    				if (media_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(media_slot, media_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_media_slot_changes, get_media_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (text_slot) {
    				if (text_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(text_slot, text_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_text_slot_changes, get_text_slot_context);
    				}
    			}

    			if (actions_slot) {
    				if (actions_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(actions_slot, actions_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_actions_slot_changes, get_actions_slot_context);
    				}
    			}

    			if (!current || dirty & /*c*/ 1) {
    				attr_dev(div, "class", /*c*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot, local);
    			transition_in(media_slot, local);
    			transition_in(default_slot, local);
    			transition_in(text_slot, local);
    			transition_in(actions_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot, local);
    			transition_out(media_slot, local);
    			transition_out(default_slot, local);
    			transition_out(text_slot, local);
    			transition_out(actions_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (title_slot) title_slot.d(detaching);
    			if (media_slot) media_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (text_slot) text_slot.d(detaching);
    			if (actions_slot) actions_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const classesDefault$8 = "rounded inline-flex flex-col overflow-hidden duration-200 ease-in";

    function instance$k($$self, $$props, $$invalidate) {
    	let c;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, ['title','media','default','text','actions']);
    	let { hover = true } = $$props;
    	let { classes = classesDefault$8 } = $$props;
    	const cb = new ClassBuilder(classes, classesDefault$8);

    	$$self.$$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("hover" in $$new_props) $$invalidate(1, hover = $$new_props.hover);
    		if ("classes" in $$new_props) $$invalidate(2, classes = $$new_props.classes);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ClassBuilder,
    		classesDefault: classesDefault$8,
    		hover,
    		classes,
    		cb,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ("hover" in $$props) $$invalidate(1, hover = $$new_props.hover);
    		if ("classes" in $$props) $$invalidate(2, classes = $$new_props.classes);
    		if ("c" in $$props) $$invalidate(0, c = $$new_props.c);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(0, c = cb.flush().add(`shadow-sm hover:shadow`, hover).add(classes, true, classesDefault$8).add($$props.class).get());
    	};

    	$$props = exclude_internal_props($$props);
    	return [c, hover, classes, $$scope, slots];
    }

    class Card$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { hover: 1, classes: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get hover() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\smelte\src\components\Card\Title.svelte generated by Svelte v3.37.0 */
    const file$h = "node_modules\\smelte\\src\\components\\Card\\Title.svelte";

    function create_fragment$j(ctx) {
    	let div4;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div3;
    	let div1;
    	let t1;
    	let t2;
    	let div2;
    	let t3;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t1 = text(/*title*/ ctx[0]);
    			t2 = space();
    			div2 = element("div");
    			t3 = text(/*subheader*/ ctx[1]);
    			attr_dev(img, "class", "rounded-full");
    			attr_dev(img, "width", "44");
    			attr_dev(img, "height", "44");
    			if (img.src !== (img_src_value = /*avatar*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "avatar");
    			toggle_class(img, "hidden", !/*avatar*/ ctx[2]);
    			add_location(img, file$h, 24, 4, 472);
    			add_location(div0, file$h, 23, 2, 462);
    			attr_dev(div1, "class", "font-medium text-lg");
    			toggle_class(div1, "hidden", !/*title*/ ctx[0]);
    			add_location(div1, file$h, 33, 4, 648);
    			attr_dev(div2, "class", "text-sm text-gray-600 pt-0");
    			toggle_class(div2, "hidden", !/*subheader*/ ctx[1]);
    			add_location(div2, file$h, 34, 4, 721);
    			attr_dev(div3, "class", "pl-4 py-2");
    			add_location(div3, file$h, 32, 2, 620);
    			attr_dev(div4, "class", /*c*/ ctx[3]);
    			add_location(div4, file$h, 22, 0, 444);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, img);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*avatar*/ 4 && img.src !== (img_src_value = /*avatar*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*avatar*/ 4) {
    				toggle_class(img, "hidden", !/*avatar*/ ctx[2]);
    			}

    			if (dirty & /*title*/ 1) set_data_dev(t1, /*title*/ ctx[0]);

    			if (dirty & /*title*/ 1) {
    				toggle_class(div1, "hidden", !/*title*/ ctx[0]);
    			}

    			if (dirty & /*subheader*/ 2) set_data_dev(t3, /*subheader*/ ctx[1]);

    			if (dirty & /*subheader*/ 2) {
    				toggle_class(div2, "hidden", !/*subheader*/ ctx[1]);
    			}

    			if (dirty & /*c*/ 8) {
    				attr_dev(div4, "class", /*c*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const classesDefault$7 = "flex px-4 py-2 items-center";

    function instance$j($$self, $$props, $$invalidate) {
    	let c;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Title", slots, []);
    	const hover = true;
    	let { title = "" } = $$props;
    	let { subheader = "" } = $$props;
    	let { avatar = "" } = $$props;
    	let { classes = classesDefault$7 } = $$props;
    	const cb = new ClassBuilder(classes, classesDefault$7);

    	$$self.$$set = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("title" in $$new_props) $$invalidate(0, title = $$new_props.title);
    		if ("subheader" in $$new_props) $$invalidate(1, subheader = $$new_props.subheader);
    		if ("avatar" in $$new_props) $$invalidate(2, avatar = $$new_props.avatar);
    		if ("classes" in $$new_props) $$invalidate(5, classes = $$new_props.classes);
    	};

    	$$self.$capture_state = () => ({
    		ClassBuilder,
    		hover,
    		title,
    		subheader,
    		avatar,
    		classesDefault: classesDefault$7,
    		classes,
    		cb,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), $$new_props));
    		if ("title" in $$props) $$invalidate(0, title = $$new_props.title);
    		if ("subheader" in $$props) $$invalidate(1, subheader = $$new_props.subheader);
    		if ("avatar" in $$props) $$invalidate(2, avatar = $$new_props.avatar);
    		if ("classes" in $$props) $$invalidate(5, classes = $$new_props.classes);
    		if ("c" in $$props) $$invalidate(3, c = $$new_props.c);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(3, c = cb.flush().add(classes, true, classesDefault$7).add($$props.class).get());
    	};

    	$$props = exclude_internal_props($$props);
    	return [title, subheader, avatar, c, hover, classes];
    }

    class Title extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			hover: 4,
    			title: 0,
    			subheader: 1,
    			avatar: 2,
    			classes: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get hover() {
    		return this.$$.ctx[4];
    	}

    	set hover(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subheader() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subheader(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get avatar() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set avatar(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Card = {
      Card: Card$1,
      Title
    };

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quadIn(t) {
        return t * t;
    }
    function quadOut(t) {
        return -t * (t - 2.0);
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* node_modules\smelte\src\components\Util\Spacer.svelte generated by Svelte v3.37.0 */

    const file$g = "node_modules\\smelte\\src\\components\\Util\\Spacer.svelte";

    function create_fragment$i(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "flex-grow");
    			add_location(div, file$g, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Spacer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spacer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Spacer$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spacer",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    const Spacer = Spacer$1;

    /* node_modules\smelte\src\components\List\ListItem.svelte generated by Svelte v3.37.0 */
    const file$f = "node_modules\\smelte\\src\\components\\List\\ListItem.svelte";

    // (59:2) {#if icon}
    function create_if_block_1$3(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				class: "pr-6",
    				small: /*dense*/ ctx[3],
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty & /*dense*/ 8) icon_1_changes.small = /*dense*/ ctx[3];

    			if (dirty & /*$$scope, icon*/ 4194305) {
    				icon_1_changes.$$scope = { dirty, ctx };
    			}

    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(59:2) {#if icon}",
    		ctx
    	});

    	return block;
    }

    // (60:4) <Icon       class="pr-6"       small={dense}     >
    function create_default_slot$7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*icon*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 1) set_data_dev(t, /*icon*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(60:4) <Icon       class=\\\"pr-6\\\"       small={dense}     >",
    		ctx
    	});

    	return block;
    }

    // (70:12) {text}
    function fallback_block$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*text*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$6.name,
    		type: "fallback",
    		source: "(70:12) {text}",
    		ctx
    	});

    	return block;
    }

    // (72:4) {#if subheading}
    function create_if_block$7(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*subheading*/ ctx[2]);
    			attr_dev(div, "class", /*subheadingClasses*/ ctx[5]);
    			add_location(div, file$f, 72, 6, 1808);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*subheading*/ 4) set_data_dev(t, /*subheading*/ ctx[2]);

    			if (dirty & /*subheadingClasses*/ 32) {
    				attr_dev(div, "class", /*subheadingClasses*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(72:4) {#if subheading}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let li;
    	let t0;
    	let div1;
    	let div0;
    	let div0_class_value;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[0] && create_if_block_1$3(ctx);
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);
    	const default_slot_or_fallback = default_slot || fallback_block$6(ctx);
    	let if_block1 = /*subheading*/ ctx[2] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", div0_class_value = /*$$props*/ ctx[9].class);
    			add_location(div0, file$f, 68, 4, 1716);
    			attr_dev(div1, "class", "flex flex-col p-0");
    			add_location(div1, file$f, 67, 2, 1680);
    			attr_dev(li, "class", /*c*/ ctx[6]);
    			attr_dev(li, "tabindex", /*tabindex*/ ctx[4]);
    			add_location(li, file$f, 51, 0, 1479);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			if (if_block0) if_block0.m(li, null);
    			append_dev(li, t0);
    			append_dev(li, div1);
    			append_dev(div1, div0);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(div0, null);
    			}

    			append_dev(div1, t1);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*ripple*/ ctx[7].call(null, li)),
    					listen_dev(li, "keypress", /*change*/ ctx[8], false, false, false),
    					listen_dev(li, "click", /*change*/ ctx[8], false, false, false),
    					listen_dev(li, "click", /*click_handler*/ ctx[21], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*icon*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*icon*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(li, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[22], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*text*/ 2) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 512 && div0_class_value !== (div0_class_value = /*$$props*/ ctx[9].class)) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (/*subheading*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$7(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*c*/ 64) {
    				attr_dev(li, "class", /*c*/ ctx[6]);
    			}

    			if (!current || dirty & /*tabindex*/ 16) {
    				attr_dev(li, "tabindex", /*tabindex*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const classesDefault$6 = "focus:bg-gray-50 dark-focus:bg-gray-700 hover:bg-gray-transDark relative overflow-hidden duration-100 p-4 cursor-pointer text-gray-700 dark:text-gray-100 flex items-center z-10";
    const selectedClassesDefault = "bg-gray-200 dark:bg-primary-transLight";
    const subheadingClassesDefault = "text-gray-600 p-0 text-sm";

    function instance$h($$self, $$props, $$invalidate) {
    	let c;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ListItem", slots, ['default']);
    	let { icon = "" } = $$props;
    	let { id = "" } = $$props;
    	let { value = "" } = $$props;
    	let { text = "" } = $$props;
    	let { subheading = "" } = $$props;
    	let { disabled = false } = $$props;
    	let { dense = false } = $$props;
    	let { selected = false } = $$props;
    	let { tabindex = null } = $$props;
    	let { selectedClasses = selectedClassesDefault } = $$props;
    	let { subheadingClasses = subheadingClassesDefault } = $$props;
    	let { to = "" } = $$props;
    	const item = null;
    	const items = [];
    	const level = null;
    	const ripple = r();
    	const dispatch = createEventDispatcher();

    	function change() {
    		if (disabled) return;
    		$$invalidate(10, value = id);
    		dispatch("change", id, to);
    	}

    	let { classes = classesDefault$6 } = $$props;
    	const cb = new ClassBuilder(classes, classesDefault$6);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(9, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("icon" in $$new_props) $$invalidate(0, icon = $$new_props.icon);
    		if ("id" in $$new_props) $$invalidate(11, id = $$new_props.id);
    		if ("value" in $$new_props) $$invalidate(10, value = $$new_props.value);
    		if ("text" in $$new_props) $$invalidate(1, text = $$new_props.text);
    		if ("subheading" in $$new_props) $$invalidate(2, subheading = $$new_props.subheading);
    		if ("disabled" in $$new_props) $$invalidate(12, disabled = $$new_props.disabled);
    		if ("dense" in $$new_props) $$invalidate(3, dense = $$new_props.dense);
    		if ("selected" in $$new_props) $$invalidate(13, selected = $$new_props.selected);
    		if ("tabindex" in $$new_props) $$invalidate(4, tabindex = $$new_props.tabindex);
    		if ("selectedClasses" in $$new_props) $$invalidate(14, selectedClasses = $$new_props.selectedClasses);
    		if ("subheadingClasses" in $$new_props) $$invalidate(5, subheadingClasses = $$new_props.subheadingClasses);
    		if ("to" in $$new_props) $$invalidate(15, to = $$new_props.to);
    		if ("classes" in $$new_props) $$invalidate(19, classes = $$new_props.classes);
    		if ("$$scope" in $$new_props) $$invalidate(22, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ClassBuilder,
    		createEventDispatcher,
    		Icon,
    		createRipple: r,
    		classesDefault: classesDefault$6,
    		selectedClassesDefault,
    		subheadingClassesDefault,
    		icon,
    		id,
    		value,
    		text,
    		subheading,
    		disabled,
    		dense,
    		selected,
    		tabindex,
    		selectedClasses,
    		subheadingClasses,
    		to,
    		item,
    		items,
    		level,
    		ripple,
    		dispatch,
    		change,
    		classes,
    		cb,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(9, $$props = assign(assign({}, $$props), $$new_props));
    		if ("icon" in $$props) $$invalidate(0, icon = $$new_props.icon);
    		if ("id" in $$props) $$invalidate(11, id = $$new_props.id);
    		if ("value" in $$props) $$invalidate(10, value = $$new_props.value);
    		if ("text" in $$props) $$invalidate(1, text = $$new_props.text);
    		if ("subheading" in $$props) $$invalidate(2, subheading = $$new_props.subheading);
    		if ("disabled" in $$props) $$invalidate(12, disabled = $$new_props.disabled);
    		if ("dense" in $$props) $$invalidate(3, dense = $$new_props.dense);
    		if ("selected" in $$props) $$invalidate(13, selected = $$new_props.selected);
    		if ("tabindex" in $$props) $$invalidate(4, tabindex = $$new_props.tabindex);
    		if ("selectedClasses" in $$props) $$invalidate(14, selectedClasses = $$new_props.selectedClasses);
    		if ("subheadingClasses" in $$props) $$invalidate(5, subheadingClasses = $$new_props.subheadingClasses);
    		if ("to" in $$props) $$invalidate(15, to = $$new_props.to);
    		if ("classes" in $$props) $$invalidate(19, classes = $$new_props.classes);
    		if ("c" in $$props) $$invalidate(6, c = $$new_props.c);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(6, c = cb.flush().add(selectedClasses, selected, selectedClassesDefault).add("py-2", dense).add("text-gray-600", disabled).add($$props.class).get());
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		icon,
    		text,
    		subheading,
    		dense,
    		tabindex,
    		subheadingClasses,
    		c,
    		ripple,
    		change,
    		$$props,
    		value,
    		id,
    		disabled,
    		selected,
    		selectedClasses,
    		to,
    		item,
    		items,
    		level,
    		classes,
    		slots,
    		click_handler,
    		$$scope
    	];
    }

    class ListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			icon: 0,
    			id: 11,
    			value: 10,
    			text: 1,
    			subheading: 2,
    			disabled: 12,
    			dense: 3,
    			selected: 13,
    			tabindex: 4,
    			selectedClasses: 14,
    			subheadingClasses: 5,
    			to: 15,
    			item: 16,
    			items: 17,
    			level: 18,
    			classes: 19
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListItem",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get icon() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subheading() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subheading(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedClasses() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedClasses(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subheadingClasses() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subheadingClasses(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get to() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		return this.$$.ctx[16];
    	}

    	set item(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		return this.$$.ctx[17];
    	}

    	set items(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get level() {
    		return this.$$.ctx[18];
    	}

    	set level(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\smelte\src\components\List\List.svelte generated by Svelte v3.37.0 */
    const file$e = "node_modules\\smelte\\src\\components\\List\\List.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    const get_item_slot_changes_1 = dirty => ({
    	item: dirty & /*items*/ 2,
    	dense: dirty & /*dense*/ 4,
    	value: dirty & /*value*/ 1
    });

    const get_item_slot_context_1 = ctx => ({
    	item: /*item*/ ctx[6],
    	dense: /*dense*/ ctx[2],
    	value: /*value*/ ctx[0]
    });

    const get_item_slot_changes = dirty => ({
    	item: dirty & /*items*/ 2,
    	dense: dirty & /*dense*/ 4,
    	value: dirty & /*value*/ 1
    });

    const get_item_slot_context = ctx => ({
    	item: /*item*/ ctx[6],
    	dense: /*dense*/ ctx[2],
    	value: /*value*/ ctx[0]
    });

    // (55:4) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const item_slot_template = /*#slots*/ ctx[12].item;
    	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[18], get_item_slot_context_1);
    	const item_slot_or_fallback = item_slot || fallback_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			if (item_slot_or_fallback) item_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (item_slot_or_fallback) {
    				item_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (item_slot) {
    				if (item_slot.p && dirty & /*$$scope, items, dense, value*/ 262151) {
    					update_slot(item_slot, item_slot_template, ctx, /*$$scope*/ ctx[18], dirty, get_item_slot_changes_1, get_item_slot_context_1);
    				}
    			} else {
    				if (item_slot_or_fallback && item_slot_or_fallback.p && dirty & /*items, value, dense*/ 7) {
    					item_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (item_slot_or_fallback) item_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(55:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (47:4) {#if item.to !== undefined}
    function create_if_block$6(ctx) {
    	let current;
    	const item_slot_template = /*#slots*/ ctx[12].item;
    	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[18], get_item_slot_context);
    	const item_slot_or_fallback = item_slot || fallback_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (item_slot_or_fallback) item_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (item_slot_or_fallback) {
    				item_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (item_slot) {
    				if (item_slot.p && dirty & /*$$scope, items, dense, value*/ 262151) {
    					update_slot(item_slot, item_slot_template, ctx, /*$$scope*/ ctx[18], dirty, get_item_slot_changes, get_item_slot_context);
    				}
    			} else {
    				if (item_slot_or_fallback && item_slot_or_fallback.p && dirty & /*items, dense, value*/ 7) {
    					item_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (item_slot_or_fallback) item_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(47:4) {#if item.to !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (57:8) <ListItem           bind:value           {selectedClasses}           {itemClasses}           {...item}           tabindex={i + 1}           id={id(item)}           selected={value === id(item)}           {dense}           on:change           on:click>
    function create_default_slot_1$4(ctx) {
    	let t_value = getText(/*item*/ ctx[6]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 2 && t_value !== (t_value = getText(/*item*/ ctx[6]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(57:8) <ListItem           bind:value           {selectedClasses}           {itemClasses}           {...item}           tabindex={i + 1}           id={id(item)}           selected={value === id(item)}           {dense}           on:change           on:click>",
    		ctx
    	});

    	return block;
    }

    // (56:47)          
    function fallback_block_1$2(ctx) {
    	let listitem;
    	let updating_value;
    	let t;
    	let current;

    	const listitem_spread_levels = [
    		{
    			selectedClasses: /*selectedClasses*/ ctx[4]
    		},
    		{ itemClasses: /*itemClasses*/ ctx[5] },
    		/*item*/ ctx[6],
    		{ tabindex: /*i*/ ctx[22] + 1 },
    		{ id: id(/*item*/ ctx[6]) },
    		{
    			selected: /*value*/ ctx[0] === id(/*item*/ ctx[6])
    		},
    		{ dense: /*dense*/ ctx[2] }
    	];

    	function listitem_value_binding_1(value) {
    		/*listitem_value_binding_1*/ ctx[15](value);
    	}

    	let listitem_props = {
    		$$slots: { default: [create_default_slot_1$4] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < listitem_spread_levels.length; i += 1) {
    		listitem_props = assign(listitem_props, listitem_spread_levels[i]);
    	}

    	if (/*value*/ ctx[0] !== void 0) {
    		listitem_props.value = /*value*/ ctx[0];
    	}

    	listitem = new ListItem({ props: listitem_props, $$inline: true });
    	binding_callbacks.push(() => bind(listitem, "value", listitem_value_binding_1));
    	listitem.$on("change", /*change_handler_1*/ ctx[16]);
    	listitem.$on("click", /*click_handler*/ ctx[17]);

    	const block = {
    		c: function create() {
    			create_component(listitem.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(listitem, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitem_changes = (dirty & /*selectedClasses, itemClasses, items, id, value, dense*/ 55)
    			? get_spread_update(listitem_spread_levels, [
    					dirty & /*selectedClasses*/ 16 && {
    						selectedClasses: /*selectedClasses*/ ctx[4]
    					},
    					dirty & /*itemClasses*/ 32 && { itemClasses: /*itemClasses*/ ctx[5] },
    					dirty & /*items*/ 2 && get_spread_object(/*item*/ ctx[6]),
    					listitem_spread_levels[3],
    					dirty & /*id, items*/ 2 && { id: id(/*item*/ ctx[6]) },
    					dirty & /*value, id, items*/ 3 && {
    						selected: /*value*/ ctx[0] === id(/*item*/ ctx[6])
    					},
    					dirty & /*dense*/ 4 && { dense: /*dense*/ ctx[2] }
    				])
    			: {};

    			if (dirty & /*$$scope, items*/ 262146) {
    				listitem_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				listitem_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			listitem.$set(listitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listitem, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1$2.name,
    		type: "fallback",
    		source: "(56:47)          ",
    		ctx
    	});

    	return block;
    }

    // (50:10) <ListItem bind:value {...item} id={id(item)} {dense} on:change>
    function create_default_slot$6(ctx) {
    	let t_value = /*item*/ ctx[6].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 2 && t_value !== (t_value = /*item*/ ctx[6].text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(50:10) <ListItem bind:value {...item} id={id(item)} {dense} on:change>",
    		ctx
    	});

    	return block;
    }

    // (48:47)          
    function fallback_block$5(ctx) {
    	let a;
    	let listitem;
    	let updating_value;
    	let a_href_value;
    	let t;
    	let current;
    	const listitem_spread_levels = [/*item*/ ctx[6], { id: id(/*item*/ ctx[6]) }, { dense: /*dense*/ ctx[2] }];

    	function listitem_value_binding(value) {
    		/*listitem_value_binding*/ ctx[13](value);
    	}

    	let listitem_props = {
    		$$slots: { default: [create_default_slot$6] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < listitem_spread_levels.length; i += 1) {
    		listitem_props = assign(listitem_props, listitem_spread_levels[i]);
    	}

    	if (/*value*/ ctx[0] !== void 0) {
    		listitem_props.value = /*value*/ ctx[0];
    	}

    	listitem = new ListItem({ props: listitem_props, $$inline: true });
    	binding_callbacks.push(() => bind(listitem, "value", listitem_value_binding));
    	listitem.$on("change", /*change_handler*/ ctx[14]);

    	const block = {
    		c: function create() {
    			a = element("a");
    			create_component(listitem.$$.fragment);
    			t = space();
    			attr_dev(a, "tabindex", /*i*/ ctx[22] + 1);
    			attr_dev(a, "href", a_href_value = /*item*/ ctx[6].to);
    			add_location(a, file$e, 48, 8, 1154);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			mount_component(listitem, a, null);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitem_changes = (dirty & /*items, id, dense*/ 6)
    			? get_spread_update(listitem_spread_levels, [
    					dirty & /*items*/ 2 && get_spread_object(/*item*/ ctx[6]),
    					dirty & /*id, items*/ 2 && { id: id(/*item*/ ctx[6]) },
    					dirty & /*dense*/ 4 && { dense: /*dense*/ ctx[2] }
    				])
    			: {};

    			if (dirty & /*$$scope, items*/ 262146) {
    				listitem_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				listitem_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			listitem.$set(listitem_changes);

    			if (!current || dirty & /*items*/ 2 && a_href_value !== (a_href_value = /*item*/ ctx[6].to)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_component(listitem);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$5.name,
    		type: "fallback",
    		source: "(48:47)          ",
    		ctx
    	});

    	return block;
    }

    // (46:2) {#each items as item, i}
    function create_each_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$6, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[6].to !== undefined) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(46:2) {#each items as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let ul;
    	let current;
    	let each_value = /*items*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", /*c*/ ctx[7]);
    			toggle_class(ul, "rounded-t-none", /*select*/ ctx[3]);
    			add_location(ul, file$e, 44, 0, 994);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items, id, dense, value, $$scope, undefined, selectedClasses, itemClasses, getText*/ 262199) {
    				each_value = /*items*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*c*/ 128) {
    				attr_dev(ul, "class", /*c*/ ctx[7]);
    			}

    			if (dirty & /*c, select*/ 136) {
    				toggle_class(ul, "rounded-t-none", /*select*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const classesDefault$5 = "py-2 rounded";

    function id(i) {
    	if (i.id !== undefined) return i.id;
    	if (i.value !== undefined) return i.value;
    	if (i.to !== undefined) return i.to;
    	if (i.text !== undefined) return i.text;
    	return i;
    }

    function getText(i) {
    	if (i.text !== undefined) return i.text;
    	if (i.value !== undefined) return i.value;
    	return i;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let c;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("List", slots, ['item']);
    	let { items = [] } = $$props;
    	let { value = "" } = $$props;
    	let { dense = false } = $$props;
    	let { select = false } = $$props;
    	const level = null;
    	const text = "";
    	const item = {};
    	const to = null;
    	const selectedClasses = i => i;
    	const itemClasses = i => i;
    	let { classes = classesDefault$5 } = $$props;
    	const cb = new ClassBuilder($$props.class);

    	function listitem_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function listitem_value_binding_1(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function change_handler_1(event) {
    		bubble($$self, event);
    	}

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(20, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("items" in $$new_props) $$invalidate(1, items = $$new_props.items);
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("dense" in $$new_props) $$invalidate(2, dense = $$new_props.dense);
    		if ("select" in $$new_props) $$invalidate(3, select = $$new_props.select);
    		if ("classes" in $$new_props) $$invalidate(11, classes = $$new_props.classes);
    		if ("$$scope" in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ClassBuilder,
    		ListItem,
    		items,
    		value,
    		dense,
    		select,
    		level,
    		text,
    		item,
    		to,
    		selectedClasses,
    		itemClasses,
    		classesDefault: classesDefault$5,
    		classes,
    		id,
    		getText,
    		cb,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(20, $$props = assign(assign({}, $$props), $$new_props));
    		if ("items" in $$props) $$invalidate(1, items = $$new_props.items);
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("dense" in $$props) $$invalidate(2, dense = $$new_props.dense);
    		if ("select" in $$props) $$invalidate(3, select = $$new_props.select);
    		if ("classes" in $$props) $$invalidate(11, classes = $$new_props.classes);
    		if ("c" in $$props) $$invalidate(7, c = $$new_props.c);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(7, c = cb.flush().add(classes, true, classesDefault$5).add($$props.class).get());
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		items,
    		dense,
    		select,
    		selectedClasses,
    		itemClasses,
    		item,
    		c,
    		level,
    		text,
    		to,
    		classes,
    		slots,
    		listitem_value_binding,
    		change_handler,
    		listitem_value_binding_1,
    		change_handler_1,
    		click_handler,
    		$$scope
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			items: 1,
    			value: 0,
    			dense: 2,
    			select: 3,
    			level: 8,
    			text: 9,
    			item: 6,
    			to: 10,
    			selectedClasses: 4,
    			itemClasses: 5,
    			classes: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get items() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get select() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set select(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get level() {
    		return this.$$.ctx[8];
    	}

    	set level(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		return this.$$.ctx[9];
    	}

    	set text(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		return this.$$.ctx[6];
    	}

    	set item(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get to() {
    		return this.$$.ctx[10];
    	}

    	set to(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedClasses() {
    		return this.$$.ctx[4];
    	}

    	set selectedClasses(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemClasses() {
    		return this.$$.ctx[5];
    	}

    	set itemClasses(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\smelte\src\components\TextField\Label.svelte generated by Svelte v3.37.0 */
    const file$d = "node_modules\\smelte\\src\\components\\TextField\\Label.svelte";

    function create_fragment$f(ctx) {
    	let label;
    	let label_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let label_levels = [
    		{
    			class: label_class_value = "" + (/*lClasses*/ ctx[0] + " " + /*$$props*/ ctx[2].class)
    		},
    		/*props*/ ctx[1]
    	];

    	let label_data = {};

    	for (let i = 0; i < label_levels.length; i += 1) {
    		label_data = assign(label_data, label_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			if (default_slot) default_slot.c();
    			set_attributes(label, label_data);
    			toggle_class(label, "svelte-r33x2y", true);
    			add_location(label, file$d, 72, 0, 1606);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32768) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[15], dirty, null, null);
    				}
    			}

    			set_attributes(label, label_data = get_spread_update(label_levels, [
    				(!current || dirty & /*lClasses, $$props*/ 5 && label_class_value !== (label_class_value = "" + (/*lClasses*/ ctx[0] + " " + /*$$props*/ ctx[2].class))) && { class: label_class_value },
    				/*props*/ ctx[1]
    			]));

    			toggle_class(label, "svelte-r33x2y", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Label", slots, ['default']);
    	let { focused = false } = $$props;
    	let { error = false } = $$props;
    	let { outlined = false } = $$props;
    	let { labelOnTop = false } = $$props;
    	let { prepend = false } = $$props;
    	let { color = "primary" } = $$props;
    	let { bgColor = "white" } = $$props;
    	let { dense = false } = $$props;
    	let labelDefault = `pt-4 absolute top-0 label-transition block pb-2 px-4 pointer-events-none cursor-text`;
    	let { add = "" } = $$props;
    	let { remove = "" } = $$props;
    	let { replace = "" } = $$props;
    	let { labelClasses = labelDefault } = $$props;
    	const { border, txt } = utils(color);
    	const l = new ClassBuilder(labelClasses, labelDefault);
    	let lClasses = i => i;
    	const props = filterProps(["focused", "error", "outlined", "labelOnTop", "prepend", "color", "dense"], $$props);

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("focused" in $$new_props) $$invalidate(3, focused = $$new_props.focused);
    		if ("error" in $$new_props) $$invalidate(4, error = $$new_props.error);
    		if ("outlined" in $$new_props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ("labelOnTop" in $$new_props) $$invalidate(6, labelOnTop = $$new_props.labelOnTop);
    		if ("prepend" in $$new_props) $$invalidate(7, prepend = $$new_props.prepend);
    		if ("color" in $$new_props) $$invalidate(8, color = $$new_props.color);
    		if ("bgColor" in $$new_props) $$invalidate(9, bgColor = $$new_props.bgColor);
    		if ("dense" in $$new_props) $$invalidate(10, dense = $$new_props.dense);
    		if ("add" in $$new_props) $$invalidate(11, add = $$new_props.add);
    		if ("remove" in $$new_props) $$invalidate(12, remove = $$new_props.remove);
    		if ("replace" in $$new_props) $$invalidate(13, replace = $$new_props.replace);
    		if ("labelClasses" in $$new_props) $$invalidate(14, labelClasses = $$new_props.labelClasses);
    		if ("$$scope" in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		utils,
    		ClassBuilder,
    		filterProps,
    		focused,
    		error,
    		outlined,
    		labelOnTop,
    		prepend,
    		color,
    		bgColor,
    		dense,
    		labelDefault,
    		add,
    		remove,
    		replace,
    		labelClasses,
    		border,
    		txt,
    		l,
    		lClasses,
    		props
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("focused" in $$props) $$invalidate(3, focused = $$new_props.focused);
    		if ("error" in $$props) $$invalidate(4, error = $$new_props.error);
    		if ("outlined" in $$props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ("labelOnTop" in $$props) $$invalidate(6, labelOnTop = $$new_props.labelOnTop);
    		if ("prepend" in $$props) $$invalidate(7, prepend = $$new_props.prepend);
    		if ("color" in $$props) $$invalidate(8, color = $$new_props.color);
    		if ("bgColor" in $$props) $$invalidate(9, bgColor = $$new_props.bgColor);
    		if ("dense" in $$props) $$invalidate(10, dense = $$new_props.dense);
    		if ("labelDefault" in $$props) labelDefault = $$new_props.labelDefault;
    		if ("add" in $$props) $$invalidate(11, add = $$new_props.add);
    		if ("remove" in $$props) $$invalidate(12, remove = $$new_props.remove);
    		if ("replace" in $$props) $$invalidate(13, replace = $$new_props.replace);
    		if ("labelClasses" in $$props) $$invalidate(14, labelClasses = $$new_props.labelClasses);
    		if ("lClasses" in $$props) $$invalidate(0, lClasses = $$new_props.lClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*focused, error, labelOnTop, outlined, bgColor, prepend, dense, add, remove, replace*/ 16120) {
    			$$invalidate(0, lClasses = l.flush().add(txt(), focused && !error).add("text-error-500", focused && error).add("label-top text-xs", labelOnTop).add("text-xs", focused).remove("pt-4 pb-2 px-4 px-1 pt-0", labelOnTop && outlined).add(`ml-3 p-1 pt-0 mt-0 bg-${bgColor} dark:bg-dark-500`, labelOnTop && outlined).remove("px-4", prepend).add("pr-4 pl-10", prepend).remove("pt-4", dense).add("pt-3", dense).add(add).remove(remove).replace(replace).get());
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		lClasses,
    		props,
    		$$props,
    		focused,
    		error,
    		outlined,
    		labelOnTop,
    		prepend,
    		color,
    		bgColor,
    		dense,
    		add,
    		remove,
    		replace,
    		labelClasses,
    		$$scope,
    		slots
    	];
    }

    class Label$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			focused: 3,
    			error: 4,
    			outlined: 5,
    			labelOnTop: 6,
    			prepend: 7,
    			color: 8,
    			bgColor: 9,
    			dense: 10,
    			add: 11,
    			remove: 12,
    			replace: 13,
    			labelClasses: 14
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Label",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get focused() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelOnTop() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelOnTop(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prepend() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prepend(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClasses() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClasses(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\smelte\src\components\TextField\Hint.svelte generated by Svelte v3.37.0 */
    const file$c = "node_modules\\smelte\\src\\components\\TextField\\Hint.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let html_tag;
    	let raw_value = (/*hint*/ ctx[1] || "") + "";
    	let t0;
    	let t1_value = (/*error*/ ctx[0] || "") + "";
    	let t1;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = space();
    			t1 = text(t1_value);
    			html_tag = new HtmlTag(t0);
    			attr_dev(div, "class", /*classes*/ ctx[3]);
    			add_location(div, file$c, 35, 0, 787);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			html_tag.m(raw_value, div);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*hint*/ 2) && raw_value !== (raw_value = (/*hint*/ ctx[1] || "") + "")) html_tag.p(raw_value);
    			if ((!current || dirty & /*error*/ 1) && t1_value !== (t1_value = (/*error*/ ctx[0] || "") + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*classes*/ 8) {
    				attr_dev(div, "class", /*classes*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, /*transitionProps*/ ctx[2], true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, /*transitionProps*/ ctx[2], false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let classes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hint", slots, []);
    	let classesDefault = "text-xs py-1 pl-4 absolute left-0";
    	let { error = false } = $$props;
    	let { hint = "" } = $$props;
    	let { add = "" } = $$props;
    	let { remove = "" } = $$props;
    	let { replace = "" } = $$props;
    	let { transitionProps = { y: -10, duration: 100, easing: quadOut } } = $$props;
    	const l = new ClassBuilder($$props.class, classesDefault);
    	let Classes = i => i;
    	const props = filterProps(["error", "hint"], $$props);

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("error" in $$new_props) $$invalidate(0, error = $$new_props.error);
    		if ("hint" in $$new_props) $$invalidate(1, hint = $$new_props.hint);
    		if ("add" in $$new_props) $$invalidate(4, add = $$new_props.add);
    		if ("remove" in $$new_props) $$invalidate(5, remove = $$new_props.remove);
    		if ("replace" in $$new_props) $$invalidate(6, replace = $$new_props.replace);
    		if ("transitionProps" in $$new_props) $$invalidate(2, transitionProps = $$new_props.transitionProps);
    	};

    	$$self.$capture_state = () => ({
    		utils,
    		ClassBuilder,
    		filterProps,
    		fly,
    		quadOut,
    		classesDefault,
    		error,
    		hint,
    		add,
    		remove,
    		replace,
    		transitionProps,
    		l,
    		Classes,
    		props,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ("classesDefault" in $$props) classesDefault = $$new_props.classesDefault;
    		if ("error" in $$props) $$invalidate(0, error = $$new_props.error);
    		if ("hint" in $$props) $$invalidate(1, hint = $$new_props.hint);
    		if ("add" in $$props) $$invalidate(4, add = $$new_props.add);
    		if ("remove" in $$props) $$invalidate(5, remove = $$new_props.remove);
    		if ("replace" in $$props) $$invalidate(6, replace = $$new_props.replace);
    		if ("transitionProps" in $$props) $$invalidate(2, transitionProps = $$new_props.transitionProps);
    		if ("Classes" in $$props) Classes = $$new_props.Classes;
    		if ("classes" in $$props) $$invalidate(3, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*error, hint, add, remove, replace*/ 115) {
    			$$invalidate(3, classes = l.flush().add("text-error-500", error).add("text-gray-600", hint).add(add).remove(remove).replace(replace).get());
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [error, hint, transitionProps, classes, add, remove, replace];
    }

    class Hint extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			error: 0,
    			hint: 1,
    			add: 4,
    			remove: 5,
    			replace: 6,
    			transitionProps: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hint",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get error() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionProps() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionProps(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\smelte\src\components\TextField\Underline.svelte generated by Svelte v3.37.0 */
    const file$b = "node_modules\\smelte\\src\\components\\TextField\\Underline.svelte";

    function create_fragment$d(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let div1_class_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*classes*/ ctx[2]) + " svelte-xd9zs6"));
    			set_style(div0, "height", "2px");
    			set_style(div0, "transition", "width .2s ease");
    			add_location(div0, file$b, 61, 2, 1133);
    			attr_dev(div1, "class", div1_class_value = "line absolute bottom-0 left-0 w-full bg-gray-600 " + /*$$props*/ ctx[3].class + " svelte-xd9zs6");
    			toggle_class(div1, "hidden", /*noUnderline*/ ctx[0] || /*outlined*/ ctx[1]);
    			add_location(div1, file$b, 58, 0, 1009);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*classes*/ 4 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*classes*/ ctx[2]) + " svelte-xd9zs6"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*$$props*/ 8 && div1_class_value !== (div1_class_value = "line absolute bottom-0 left-0 w-full bg-gray-600 " + /*$$props*/ ctx[3].class + " svelte-xd9zs6")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*$$props, noUnderline, outlined*/ 11) {
    				toggle_class(div1, "hidden", /*noUnderline*/ ctx[0] || /*outlined*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let classes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Underline", slots, []);
    	let { noUnderline = false } = $$props;
    	let { outlined = false } = $$props;
    	let { focused = false } = $$props;
    	let { error = false } = $$props;
    	let { color = "primary" } = $$props;
    	let defaultClasses = `mx-auto w-0`;
    	let { add = "" } = $$props;
    	let { remove = "" } = $$props;
    	let { replace = "" } = $$props;
    	let { lineClasses = defaultClasses } = $$props;
    	const { bg, border, txt, caret } = utils(color);
    	const l = new ClassBuilder(lineClasses, defaultClasses);
    	let Classes = i => i;
    	const props = filterProps(["focused", "error", "outlined", "labelOnTop", "prepend", "bgcolor", "color"], $$props);

    	$$self.$$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("noUnderline" in $$new_props) $$invalidate(0, noUnderline = $$new_props.noUnderline);
    		if ("outlined" in $$new_props) $$invalidate(1, outlined = $$new_props.outlined);
    		if ("focused" in $$new_props) $$invalidate(4, focused = $$new_props.focused);
    		if ("error" in $$new_props) $$invalidate(5, error = $$new_props.error);
    		if ("color" in $$new_props) $$invalidate(6, color = $$new_props.color);
    		if ("add" in $$new_props) $$invalidate(7, add = $$new_props.add);
    		if ("remove" in $$new_props) $$invalidate(8, remove = $$new_props.remove);
    		if ("replace" in $$new_props) $$invalidate(9, replace = $$new_props.replace);
    		if ("lineClasses" in $$new_props) $$invalidate(10, lineClasses = $$new_props.lineClasses);
    	};

    	$$self.$capture_state = () => ({
    		utils,
    		ClassBuilder,
    		filterProps,
    		noUnderline,
    		outlined,
    		focused,
    		error,
    		color,
    		defaultClasses,
    		add,
    		remove,
    		replace,
    		lineClasses,
    		bg,
    		border,
    		txt,
    		caret,
    		l,
    		Classes,
    		props,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ("noUnderline" in $$props) $$invalidate(0, noUnderline = $$new_props.noUnderline);
    		if ("outlined" in $$props) $$invalidate(1, outlined = $$new_props.outlined);
    		if ("focused" in $$props) $$invalidate(4, focused = $$new_props.focused);
    		if ("error" in $$props) $$invalidate(5, error = $$new_props.error);
    		if ("color" in $$props) $$invalidate(6, color = $$new_props.color);
    		if ("defaultClasses" in $$props) defaultClasses = $$new_props.defaultClasses;
    		if ("add" in $$props) $$invalidate(7, add = $$new_props.add);
    		if ("remove" in $$props) $$invalidate(8, remove = $$new_props.remove);
    		if ("replace" in $$props) $$invalidate(9, replace = $$new_props.replace);
    		if ("lineClasses" in $$props) $$invalidate(10, lineClasses = $$new_props.lineClasses);
    		if ("Classes" in $$props) Classes = $$new_props.Classes;
    		if ("classes" in $$props) $$invalidate(2, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*focused, error, add, remove, replace*/ 944) {
    			$$invalidate(2, classes = l.flush().add(txt(), focused && !error).add("bg-error-500", error).add("w-full", focused || error).add(bg(), focused).add(add).remove(remove).replace(replace).get());
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		noUnderline,
    		outlined,
    		classes,
    		$$props,
    		focused,
    		error,
    		color,
    		add,
    		remove,
    		replace,
    		lineClasses
    	];
    }

    class Underline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			noUnderline: 0,
    			outlined: 1,
    			focused: 4,
    			error: 5,
    			color: 6,
    			add: 7,
    			remove: 8,
    			replace: 9,
    			lineClasses: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Underline",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get noUnderline() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noUnderline(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focused() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lineClasses() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lineClasses(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\smelte\src\components\TextField\TextField.svelte generated by Svelte v3.37.0 */
    const file$a = "node_modules\\smelte\\src\\components\\TextField\\TextField.svelte";
    const get_prepend_slot_changes = dirty => ({});
    const get_prepend_slot_context = ctx => ({});
    const get_append_slot_changes = dirty => ({});
    const get_append_slot_context = ctx => ({});
    const get_label_slot_changes$1 = dirty => ({});
    const get_label_slot_context$1 = ctx => ({});

    // (139:2) {#if label}
    function create_if_block_6(ctx) {
    	let current;
    	const label_slot_template = /*#slots*/ ctx[40].label;
    	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[69], get_label_slot_context$1);
    	const label_slot_or_fallback = label_slot || fallback_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (label_slot_or_fallback) label_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (label_slot_or_fallback) {
    				label_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (label_slot) {
    				if (label_slot.p && dirty[2] & /*$$scope*/ 128) {
    					update_slot(label_slot, label_slot_template, ctx, /*$$scope*/ ctx[69], dirty, get_label_slot_changes$1, get_label_slot_context$1);
    				}
    			} else {
    				if (label_slot_or_fallback && label_slot_or_fallback.p && dirty[0] & /*labelOnTop, focused, error, outlined, prepend, color, bgColor, dense, label*/ 33952078) {
    					label_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (label_slot_or_fallback) label_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(139:2) {#if label}",
    		ctx
    	});

    	return block;
    }

    // (141:4) <Label       {labelOnTop}       {focused}       {error}       {outlined}       {prepend}       {color}       {bgColor}       dense={dense && !outlined}     >
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*label*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*label*/ 8) set_data_dev(t, /*label*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(141:4) <Label       {labelOnTop}       {focused}       {error}       {outlined}       {prepend}       {color}       {bgColor}       dense={dense && !outlined}     >",
    		ctx
    	});

    	return block;
    }

    // (140:21)      
    function fallback_block_2(ctx) {
    	let label_1;
    	let current;

    	label_1 = new Label$1({
    			props: {
    				labelOnTop: /*labelOnTop*/ ctx[25],
    				focused: /*focused*/ ctx[1],
    				error: /*error*/ ctx[6],
    				outlined: /*outlined*/ ctx[2],
    				prepend: /*prepend*/ ctx[8],
    				color: /*color*/ ctx[17],
    				bgColor: /*bgColor*/ ctx[18],
    				dense: /*dense*/ ctx[12] && !/*outlined*/ ctx[2],
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_1_changes = {};
    			if (dirty[0] & /*labelOnTop*/ 33554432) label_1_changes.labelOnTop = /*labelOnTop*/ ctx[25];
    			if (dirty[0] & /*focused*/ 2) label_1_changes.focused = /*focused*/ ctx[1];
    			if (dirty[0] & /*error*/ 64) label_1_changes.error = /*error*/ ctx[6];
    			if (dirty[0] & /*outlined*/ 4) label_1_changes.outlined = /*outlined*/ ctx[2];
    			if (dirty[0] & /*prepend*/ 256) label_1_changes.prepend = /*prepend*/ ctx[8];
    			if (dirty[0] & /*color*/ 131072) label_1_changes.color = /*color*/ ctx[17];
    			if (dirty[0] & /*bgColor*/ 262144) label_1_changes.bgColor = /*bgColor*/ ctx[18];
    			if (dirty[0] & /*dense, outlined*/ 4100) label_1_changes.dense = /*dense*/ ctx[12] && !/*outlined*/ ctx[2];

    			if (dirty[0] & /*label*/ 8 | dirty[2] & /*$$scope*/ 128) {
    				label_1_changes.$$scope = { dirty, ctx };
    			}

    			label_1.$set(label_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(140:21)      ",
    		ctx
    	});

    	return block;
    }

    // (191:36) 
    function create_if_block_5(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			input.readOnly = true;
    			attr_dev(input, "class", /*iClasses*/ ctx[26]);
    			input.disabled = /*disabled*/ ctx[20];
    			input.value = /*value*/ ctx[0];
    			add_location(input, file$a, 191, 4, 4933);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*change_handler_2*/ ctx[57], false, false, false),
    					listen_dev(input, "input", /*input_handler_2*/ ctx[58], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_2*/ ctx[59], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_2*/ ctx[60], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_2*/ ctx[61], false, false, false),
    					listen_dev(input, "click", /*click_handler_2*/ ctx[62], false, false, false),
    					listen_dev(input, "blur", /*blur_handler_2*/ ctx[63], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_2*/ ctx[64], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*iClasses*/ 67108864) {
    				attr_dev(input, "class", /*iClasses*/ ctx[26]);
    			}

    			if (dirty[0] & /*disabled*/ 1048576) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[20]);
    			}

    			if (dirty[0] & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				prop_dev(input, "value", /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(191:36) ",
    		ctx
    	});

    	return block;
    }

    // (172:32) 
    function create_if_block_4(ctx) {
    	let textarea_1;
    	let textarea_1_placeholder_value;
    	let mounted;
    	let dispose;

    	let textarea_1_levels = [
    		{ rows: /*rows*/ ctx[10] },
    		{ "aria-label": /*label*/ ctx[3] },
    		{ class: /*iClasses*/ ctx[26] },
    		{ disabled: /*disabled*/ ctx[20] },
    		/*props*/ ctx[29],
    		{
    			placeholder: textarea_1_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[4] : ""
    		}
    	];

    	let textarea_1_data = {};

    	for (let i = 0; i < textarea_1_levels.length; i += 1) {
    		textarea_1_data = assign(textarea_1_data, textarea_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			textarea_1 = element("textarea");
    			set_attributes(textarea_1, textarea_1_data);
    			add_location(textarea_1, file$a, 172, 4, 4535);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea_1, anchor);
    			set_input_value(textarea_1, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea_1, "change", /*change_handler_1*/ ctx[49], false, false, false),
    					listen_dev(textarea_1, "input", /*input_handler_1*/ ctx[50], false, false, false),
    					listen_dev(textarea_1, "keydown", /*keydown_handler_1*/ ctx[51], false, false, false),
    					listen_dev(textarea_1, "keypress", /*keypress_handler_1*/ ctx[52], false, false, false),
    					listen_dev(textarea_1, "keyup", /*keyup_handler_1*/ ctx[53], false, false, false),
    					listen_dev(textarea_1, "click", /*click_handler_1*/ ctx[54], false, false, false),
    					listen_dev(textarea_1, "focus", /*focus_handler_1*/ ctx[55], false, false, false),
    					listen_dev(textarea_1, "blur", /*blur_handler_1*/ ctx[56], false, false, false),
    					listen_dev(textarea_1, "input", /*textarea_1_input_handler*/ ctx[66]),
    					listen_dev(textarea_1, "focus", /*toggleFocused*/ ctx[28], false, false, false),
    					listen_dev(textarea_1, "blur", /*toggleFocused*/ ctx[28], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(textarea_1, textarea_1_data = get_spread_update(textarea_1_levels, [
    				dirty[0] & /*rows*/ 1024 && { rows: /*rows*/ ctx[10] },
    				dirty[0] & /*label*/ 8 && { "aria-label": /*label*/ ctx[3] },
    				dirty[0] & /*iClasses*/ 67108864 && { class: /*iClasses*/ ctx[26] },
    				dirty[0] & /*disabled*/ 1048576 && { disabled: /*disabled*/ ctx[20] },
    				/*props*/ ctx[29],
    				dirty[0] & /*value, placeholder*/ 17 && textarea_1_placeholder_value !== (textarea_1_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[4] : "") && {
    					placeholder: textarea_1_placeholder_value
    				}
    			]));

    			if (dirty[0] & /*value*/ 1) {
    				set_input_value(textarea_1, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(172:32) ",
    		ctx
    	});

    	return block;
    }

    // (154:2) {#if (!textarea && !select) || autocomplete}
    function create_if_block_3(ctx) {
    	let input;
    	let input_placeholder_value;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		{ "aria-label": /*label*/ ctx[3] },
    		{ class: /*iClasses*/ ctx[26] },
    		{ disabled: /*disabled*/ ctx[20] },
    		/*props*/ ctx[29],
    		{
    			placeholder: input_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[4] : ""
    		}
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$a, 154, 4, 4157);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "focus", /*toggleFocused*/ ctx[28], false, false, false),
    					listen_dev(input, "blur", /*toggleFocused*/ ctx[28], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[41], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[65]),
    					listen_dev(input, "change", /*change_handler*/ ctx[42], false, false, false),
    					listen_dev(input, "input", /*input_handler*/ ctx[43], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler*/ ctx[44], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler*/ ctx[45], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler*/ ctx[46], false, false, false),
    					listen_dev(input, "click", /*click_handler*/ ctx[47], false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[48], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*label*/ 8 && { "aria-label": /*label*/ ctx[3] },
    				dirty[0] & /*iClasses*/ 67108864 && { class: /*iClasses*/ ctx[26] },
    				dirty[0] & /*disabled*/ 1048576 && { disabled: /*disabled*/ ctx[20] },
    				/*props*/ ctx[29],
    				dirty[0] & /*value, placeholder*/ 17 && input_placeholder_value !== (input_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[4] : "") && { placeholder: input_placeholder_value }
    			]));

    			if (dirty[0] & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(154:2) {#if (!textarea && !select) || autocomplete}",
    		ctx
    	});

    	return block;
    }

    // (207:2) {#if append}
    function create_if_block_2$1(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const append_slot_template = /*#slots*/ ctx[40].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[69], get_append_slot_context);
    	const append_slot_or_fallback = append_slot || fallback_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (append_slot_or_fallback) append_slot_or_fallback.c();
    			attr_dev(div, "class", /*aClasses*/ ctx[22]);
    			add_location(div, file$a, 207, 4, 5167);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (append_slot_or_fallback) {
    				append_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_3*/ ctx[67], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (append_slot) {
    				if (append_slot.p && dirty[2] & /*$$scope*/ 128) {
    					update_slot(append_slot, append_slot_template, ctx, /*$$scope*/ ctx[69], dirty, get_append_slot_changes, get_append_slot_context);
    				}
    			} else {
    				if (append_slot_or_fallback && append_slot_or_fallback.p && dirty[0] & /*appendReverse, focused, iconClass, append*/ 557186) {
    					append_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty[0] & /*aClasses*/ 4194304) {
    				attr_dev(div, "class", /*aClasses*/ ctx[22]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(append_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(append_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (append_slot_or_fallback) append_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(207:2) {#if append}",
    		ctx
    	});

    	return block;
    }

    // (213:8) <Icon           reverse={appendReverse}           class="{focused ? txt() : ""} {iconClass}"         >
    function create_default_slot_1$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*append*/ ctx[7]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*append*/ 128) set_data_dev(t, /*append*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(213:8) <Icon           reverse={appendReverse}           class=\\\"{focused ? txt() : \\\"\\\"} {iconClass}\\\"         >",
    		ctx
    	});

    	return block;
    }

    // (212:26)          
    function fallback_block_1$1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				reverse: /*appendReverse*/ ctx[15],
    				class: "" + ((/*focused*/ ctx[1] ? /*txt*/ ctx[27]() : "") + " " + /*iconClass*/ ctx[19]),
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty[0] & /*appendReverse*/ 32768) icon_changes.reverse = /*appendReverse*/ ctx[15];
    			if (dirty[0] & /*focused, iconClass*/ 524290) icon_changes.class = "" + ((/*focused*/ ctx[1] ? /*txt*/ ctx[27]() : "") + " " + /*iconClass*/ ctx[19]);

    			if (dirty[0] & /*append*/ 128 | dirty[2] & /*$$scope*/ 128) {
    				icon_changes.$$scope = { dirty, ctx };
    			}

    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1$1.name,
    		type: "fallback",
    		source: "(212:26)          ",
    		ctx
    	});

    	return block;
    }

    // (223:2) {#if prepend}
    function create_if_block_1$2(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[40].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[69], get_prepend_slot_context);
    	const prepend_slot_or_fallback = prepend_slot || fallback_block$4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (prepend_slot_or_fallback) prepend_slot_or_fallback.c();
    			attr_dev(div, "class", /*pClasses*/ ctx[23]);
    			add_location(div, file$a, 223, 4, 5476);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (prepend_slot_or_fallback) {
    				prepend_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_4*/ ctx[68], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_slot) {
    				if (prepend_slot.p && dirty[2] & /*$$scope*/ 128) {
    					update_slot(prepend_slot, prepend_slot_template, ctx, /*$$scope*/ ctx[69], dirty, get_prepend_slot_changes, get_prepend_slot_context);
    				}
    			} else {
    				if (prepend_slot_or_fallback && prepend_slot_or_fallback.p && dirty[0] & /*prependReverse, focused, iconClass, prepend*/ 590082) {
    					prepend_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty[0] & /*pClasses*/ 8388608) {
    				attr_dev(div, "class", /*pClasses*/ ctx[23]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (prepend_slot_or_fallback) prepend_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(223:2) {#if prepend}",
    		ctx
    	});

    	return block;
    }

    // (229:8) <Icon           reverse={prependReverse}           class="{focused ? txt() : ""} {iconClass}"         >
    function create_default_slot$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*prepend*/ ctx[8]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*prepend*/ 256) set_data_dev(t, /*prepend*/ ctx[8]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(229:8) <Icon           reverse={prependReverse}           class=\\\"{focused ? txt() : \\\"\\\"} {iconClass}\\\"         >",
    		ctx
    	});

    	return block;
    }

    // (228:27)          
    function fallback_block$4(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				reverse: /*prependReverse*/ ctx[16],
    				class: "" + ((/*focused*/ ctx[1] ? /*txt*/ ctx[27]() : "") + " " + /*iconClass*/ ctx[19]),
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty[0] & /*prependReverse*/ 65536) icon_changes.reverse = /*prependReverse*/ ctx[16];
    			if (dirty[0] & /*focused, iconClass*/ 524290) icon_changes.class = "" + ((/*focused*/ ctx[1] ? /*txt*/ ctx[27]() : "") + " " + /*iconClass*/ ctx[19]);

    			if (dirty[0] & /*prepend*/ 256 | dirty[2] & /*$$scope*/ 128) {
    				icon_changes.$$scope = { dirty, ctx };
    			}

    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$4.name,
    		type: "fallback",
    		source: "(228:27)          ",
    		ctx
    	});

    	return block;
    }

    // (245:2) {#if showHint}
    function create_if_block$5(ctx) {
    	let hint_1;
    	let current;

    	hint_1 = new Hint({
    			props: {
    				error: /*error*/ ctx[6],
    				hint: /*hint*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(hint_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hint_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const hint_1_changes = {};
    			if (dirty[0] & /*error*/ 64) hint_1_changes.error = /*error*/ ctx[6];
    			if (dirty[0] & /*hint*/ 32) hint_1_changes.hint = /*hint*/ ctx[5];
    			hint_1.$set(hint_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hint_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hint_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hint_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(245:2) {#if showHint}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let underline;
    	let t4;
    	let current;
    	let if_block0 = /*label*/ ctx[3] && create_if_block_6(ctx);

    	function select_block_type(ctx, dirty) {
    		if (!/*textarea*/ ctx[9] && !/*select*/ ctx[11] || /*autocomplete*/ ctx[13]) return create_if_block_3;
    		if (/*textarea*/ ctx[9] && !/*select*/ ctx[11]) return create_if_block_4;
    		if (/*select*/ ctx[11] && !/*autocomplete*/ ctx[13]) return create_if_block_5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type && current_block_type(ctx);
    	let if_block2 = /*append*/ ctx[7] && create_if_block_2$1(ctx);
    	let if_block3 = /*prepend*/ ctx[8] && create_if_block_1$2(ctx);

    	underline = new Underline({
    			props: {
    				noUnderline: /*noUnderline*/ ctx[14],
    				outlined: /*outlined*/ ctx[2],
    				focused: /*focused*/ ctx[1],
    				error: /*error*/ ctx[6]
    			},
    			$$inline: true
    		});

    	let if_block4 = /*showHint*/ ctx[24] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			create_component(underline.$$.fragment);
    			t4 = space();
    			if (if_block4) if_block4.c();
    			attr_dev(div, "class", /*wClasses*/ ctx[21]);
    			add_location(div, file$a, 137, 0, 3851);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(div, t2);
    			if (if_block3) if_block3.m(div, null);
    			append_dev(div, t3);
    			mount_component(underline, div, null);
    			append_dev(div, t4);
    			if (if_block4) if_block4.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*label*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*label*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			}

    			if (/*append*/ ctx[7]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*append*/ 128) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_2$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*prepend*/ ctx[8]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*prepend*/ 256) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_1$2(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			const underline_changes = {};
    			if (dirty[0] & /*noUnderline*/ 16384) underline_changes.noUnderline = /*noUnderline*/ ctx[14];
    			if (dirty[0] & /*outlined*/ 4) underline_changes.outlined = /*outlined*/ ctx[2];
    			if (dirty[0] & /*focused*/ 2) underline_changes.focused = /*focused*/ ctx[1];
    			if (dirty[0] & /*error*/ 64) underline_changes.error = /*error*/ ctx[6];
    			underline.$set(underline_changes);

    			if (/*showHint*/ ctx[24]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*showHint*/ 16777216) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block$5(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div, null);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*wClasses*/ 2097152) {
    				attr_dev(div, "class", /*wClasses*/ ctx[21]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(underline.$$.fragment, local);
    			transition_in(if_block4);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(underline.$$.fragment, local);
    			transition_out(if_block4);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();

    			if (if_block1) {
    				if_block1.d();
    			}

    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			destroy_component(underline);
    			if (if_block4) if_block4.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const inputDefault = "pb-2 pt-6 px-4 rounded-t text-black dark:text-gray-100 w-full";
    const classesDefault$4 = "mt-2 mb-6 relative text-gray-600 dark:text-gray-100";
    const appendDefault = "absolute right-0 top-0 pb-2 pr-4 pt-4 text-gray-700 z-10";
    const prependDefault = "absolute left-0 top-0 pb-2 pl-2 pt-4 text-xs text-gray-700 z-10";

    function instance$c($$self, $$props, $$invalidate) {
    	let showHint;
    	let labelOnTop;
    	let iClasses;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TextField", slots, ['label','append','prepend']);
    	let { outlined = false } = $$props;
    	let { value = null } = $$props;
    	let { label = "" } = $$props;
    	let { placeholder = "" } = $$props;
    	let { hint = "" } = $$props;
    	let { error = false } = $$props;
    	let { append = "" } = $$props;
    	let { prepend = "" } = $$props;
    	let { persistentHint = false } = $$props;
    	let { textarea = false } = $$props;
    	let { rows = 5 } = $$props;
    	let { select = false } = $$props;
    	let { dense = false } = $$props;
    	let { autocomplete = false } = $$props;
    	let { noUnderline = false } = $$props;
    	let { appendReverse = false } = $$props;
    	let { prependReverse = false } = $$props;
    	let { color = "primary" } = $$props;
    	let { bgColor = "white" } = $$props;
    	let { iconClass = "" } = $$props;
    	let { disabled = false } = $$props;
    	let { add = "" } = $$props;
    	let { remove = "" } = $$props;
    	let { replace = "" } = $$props;
    	let { inputClasses = inputDefault } = $$props;
    	let { classes = classesDefault$4 } = $$props;
    	let { appendClasses = appendDefault } = $$props;
    	let { prependClasses = prependDefault } = $$props;
    	const { bg, border, txt, caret } = utils(color);
    	const cb = new ClassBuilder(inputClasses, inputDefault);
    	const ccb = new ClassBuilder(classes, classesDefault$4);
    	const acb = new ClassBuilder(appendClasses, appendDefault);
    	const pcb = new ClassBuilder(prependClasses, prependDefault);

    	let { extend = () => {
    		
    	} } = $$props;

    	let { focused = false } = $$props;
    	let wClasses = i => i;
    	let aClasses = i => i;
    	let pClasses = i => i;

    	function toggleFocused() {
    		$$invalidate(1, focused = !focused);
    	}

    	const props = filterProps(
    		[
    			"outlined",
    			"label",
    			"placeholder",
    			"hint",
    			"error",
    			"append",
    			"prepend",
    			"persistentHint",
    			"textarea",
    			"rows",
    			"select",
    			"autocomplete",
    			"noUnderline",
    			"appendReverse",
    			"prependReverse",
    			"color",
    			"bgColor",
    			"disabled",
    			"replace",
    			"remove",
    			"small"
    		],
    		$$props
    	);

    	const dispatch = createEventDispatcher();

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function change_handler_1(event) {
    		bubble($$self, event);
    	}

    	function input_handler_1(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_1(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_1(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_1(event) {
    		bubble($$self, event);
    	}

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_1(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_1(event) {
    		bubble($$self, event);
    	}

    	function change_handler_2(event) {
    		bubble($$self, event);
    	}

    	function input_handler_2(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler_2(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler_2(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler_2(event) {
    		bubble($$self, event);
    	}

    	function click_handler_2(event) {
    		bubble($$self, event);
    	}

    	function blur_handler_2(event) {
    		bubble($$self, event);
    	}

    	function focus_handler_2(event) {
    		bubble($$self, event);
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function textarea_1_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	const click_handler_3 = () => dispatch("click-append");
    	const click_handler_4 = () => dispatch("click-prepend");

    	$$self.$$set = $$new_props => {
    		$$invalidate(77, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("outlined" in $$new_props) $$invalidate(2, outlined = $$new_props.outlined);
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("label" in $$new_props) $$invalidate(3, label = $$new_props.label);
    		if ("placeholder" in $$new_props) $$invalidate(4, placeholder = $$new_props.placeholder);
    		if ("hint" in $$new_props) $$invalidate(5, hint = $$new_props.hint);
    		if ("error" in $$new_props) $$invalidate(6, error = $$new_props.error);
    		if ("append" in $$new_props) $$invalidate(7, append = $$new_props.append);
    		if ("prepend" in $$new_props) $$invalidate(8, prepend = $$new_props.prepend);
    		if ("persistentHint" in $$new_props) $$invalidate(31, persistentHint = $$new_props.persistentHint);
    		if ("textarea" in $$new_props) $$invalidate(9, textarea = $$new_props.textarea);
    		if ("rows" in $$new_props) $$invalidate(10, rows = $$new_props.rows);
    		if ("select" in $$new_props) $$invalidate(11, select = $$new_props.select);
    		if ("dense" in $$new_props) $$invalidate(12, dense = $$new_props.dense);
    		if ("autocomplete" in $$new_props) $$invalidate(13, autocomplete = $$new_props.autocomplete);
    		if ("noUnderline" in $$new_props) $$invalidate(14, noUnderline = $$new_props.noUnderline);
    		if ("appendReverse" in $$new_props) $$invalidate(15, appendReverse = $$new_props.appendReverse);
    		if ("prependReverse" in $$new_props) $$invalidate(16, prependReverse = $$new_props.prependReverse);
    		if ("color" in $$new_props) $$invalidate(17, color = $$new_props.color);
    		if ("bgColor" in $$new_props) $$invalidate(18, bgColor = $$new_props.bgColor);
    		if ("iconClass" in $$new_props) $$invalidate(19, iconClass = $$new_props.iconClass);
    		if ("disabled" in $$new_props) $$invalidate(20, disabled = $$new_props.disabled);
    		if ("add" in $$new_props) $$invalidate(32, add = $$new_props.add);
    		if ("remove" in $$new_props) $$invalidate(33, remove = $$new_props.remove);
    		if ("replace" in $$new_props) $$invalidate(34, replace = $$new_props.replace);
    		if ("inputClasses" in $$new_props) $$invalidate(35, inputClasses = $$new_props.inputClasses);
    		if ("classes" in $$new_props) $$invalidate(36, classes = $$new_props.classes);
    		if ("appendClasses" in $$new_props) $$invalidate(37, appendClasses = $$new_props.appendClasses);
    		if ("prependClasses" in $$new_props) $$invalidate(38, prependClasses = $$new_props.prependClasses);
    		if ("extend" in $$new_props) $$invalidate(39, extend = $$new_props.extend);
    		if ("focused" in $$new_props) $$invalidate(1, focused = $$new_props.focused);
    		if ("$$scope" in $$new_props) $$invalidate(69, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		utils,
    		ClassBuilder,
    		filterProps,
    		Icon,
    		Label: Label$1,
    		Hint,
    		Underline,
    		outlined,
    		value,
    		label,
    		placeholder,
    		hint,
    		error,
    		append,
    		prepend,
    		persistentHint,
    		textarea,
    		rows,
    		select,
    		dense,
    		autocomplete,
    		noUnderline,
    		appendReverse,
    		prependReverse,
    		color,
    		bgColor,
    		iconClass,
    		disabled,
    		inputDefault,
    		classesDefault: classesDefault$4,
    		appendDefault,
    		prependDefault,
    		add,
    		remove,
    		replace,
    		inputClasses,
    		classes,
    		appendClasses,
    		prependClasses,
    		bg,
    		border,
    		txt,
    		caret,
    		cb,
    		ccb,
    		acb,
    		pcb,
    		extend,
    		focused,
    		wClasses,
    		aClasses,
    		pClasses,
    		toggleFocused,
    		props,
    		dispatch,
    		showHint,
    		labelOnTop,
    		iClasses
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(77, $$props = assign(assign({}, $$props), $$new_props));
    		if ("outlined" in $$props) $$invalidate(2, outlined = $$new_props.outlined);
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("label" in $$props) $$invalidate(3, label = $$new_props.label);
    		if ("placeholder" in $$props) $$invalidate(4, placeholder = $$new_props.placeholder);
    		if ("hint" in $$props) $$invalidate(5, hint = $$new_props.hint);
    		if ("error" in $$props) $$invalidate(6, error = $$new_props.error);
    		if ("append" in $$props) $$invalidate(7, append = $$new_props.append);
    		if ("prepend" in $$props) $$invalidate(8, prepend = $$new_props.prepend);
    		if ("persistentHint" in $$props) $$invalidate(31, persistentHint = $$new_props.persistentHint);
    		if ("textarea" in $$props) $$invalidate(9, textarea = $$new_props.textarea);
    		if ("rows" in $$props) $$invalidate(10, rows = $$new_props.rows);
    		if ("select" in $$props) $$invalidate(11, select = $$new_props.select);
    		if ("dense" in $$props) $$invalidate(12, dense = $$new_props.dense);
    		if ("autocomplete" in $$props) $$invalidate(13, autocomplete = $$new_props.autocomplete);
    		if ("noUnderline" in $$props) $$invalidate(14, noUnderline = $$new_props.noUnderline);
    		if ("appendReverse" in $$props) $$invalidate(15, appendReverse = $$new_props.appendReverse);
    		if ("prependReverse" in $$props) $$invalidate(16, prependReverse = $$new_props.prependReverse);
    		if ("color" in $$props) $$invalidate(17, color = $$new_props.color);
    		if ("bgColor" in $$props) $$invalidate(18, bgColor = $$new_props.bgColor);
    		if ("iconClass" in $$props) $$invalidate(19, iconClass = $$new_props.iconClass);
    		if ("disabled" in $$props) $$invalidate(20, disabled = $$new_props.disabled);
    		if ("add" in $$props) $$invalidate(32, add = $$new_props.add);
    		if ("remove" in $$props) $$invalidate(33, remove = $$new_props.remove);
    		if ("replace" in $$props) $$invalidate(34, replace = $$new_props.replace);
    		if ("inputClasses" in $$props) $$invalidate(35, inputClasses = $$new_props.inputClasses);
    		if ("classes" in $$props) $$invalidate(36, classes = $$new_props.classes);
    		if ("appendClasses" in $$props) $$invalidate(37, appendClasses = $$new_props.appendClasses);
    		if ("prependClasses" in $$props) $$invalidate(38, prependClasses = $$new_props.prependClasses);
    		if ("extend" in $$props) $$invalidate(39, extend = $$new_props.extend);
    		if ("focused" in $$props) $$invalidate(1, focused = $$new_props.focused);
    		if ("wClasses" in $$props) $$invalidate(21, wClasses = $$new_props.wClasses);
    		if ("aClasses" in $$props) $$invalidate(22, aClasses = $$new_props.aClasses);
    		if ("pClasses" in $$props) $$invalidate(23, pClasses = $$new_props.pClasses);
    		if ("showHint" in $$props) $$invalidate(24, showHint = $$new_props.showHint);
    		if ("labelOnTop" in $$props) $$invalidate(25, labelOnTop = $$new_props.labelOnTop);
    		if ("iClasses" in $$props) $$invalidate(26, iClasses = $$new_props.iClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*error, hint, focused*/ 98 | $$self.$$.dirty[1] & /*persistentHint*/ 1) {
    			$$invalidate(24, showHint = error || (persistentHint ? hint : focused && hint));
    		}

    		if ($$self.$$.dirty[0] & /*placeholder, focused, value*/ 19) {
    			$$invalidate(25, labelOnTop = placeholder || focused || (value || value === 0));
    		}

    		$$invalidate(26, iClasses = cb.flush().remove("pt-6 pb-2", outlined).add("border rounded bg-transparent py-4 duration-200 ease-in", outlined).add("border-error-500 caret-error-500", error).remove(caret(), error).add(caret(), !error).add(border(), outlined && focused && !error).add("bg-gray-100 dark:bg-dark-600", !outlined).add("bg-gray-300 dark:bg-dark-200", focused && !outlined).remove("px-4", prepend).add("pr-4 pl-10", prepend).add(add).remove("pt-6 pb-2", dense && !outlined).add("pt-4 pb-1", dense && !outlined).remove("bg-gray-100", disabled).add("bg-gray-50", disabled).add("cursor-pointer", select && !autocomplete).add($$props.class).remove(remove).replace(replace).extend(extend).get());

    		if ($$self.$$.dirty[0] & /*select, autocomplete, dense, outlined, error, disabled*/ 1062980) {
    			$$invalidate(21, wClasses = ccb.flush().add("select", select || autocomplete).add("dense", dense && !outlined).remove("mb-6 mt-2", dense && !outlined).add("mb-4 mt-1", dense).replace({ "text-gray-600": "text-error-500" }, error).add("text-gray-200", disabled).get());
    		}
    	};

    	$$invalidate(22, aClasses = acb.flush().get());
    	$$invalidate(23, pClasses = pcb.flush().get());
    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		focused,
    		outlined,
    		label,
    		placeholder,
    		hint,
    		error,
    		append,
    		prepend,
    		textarea,
    		rows,
    		select,
    		dense,
    		autocomplete,
    		noUnderline,
    		appendReverse,
    		prependReverse,
    		color,
    		bgColor,
    		iconClass,
    		disabled,
    		wClasses,
    		aClasses,
    		pClasses,
    		showHint,
    		labelOnTop,
    		iClasses,
    		txt,
    		toggleFocused,
    		props,
    		dispatch,
    		persistentHint,
    		add,
    		remove,
    		replace,
    		inputClasses,
    		classes,
    		appendClasses,
    		prependClasses,
    		extend,
    		slots,
    		blur_handler,
    		change_handler,
    		input_handler,
    		keydown_handler,
    		keypress_handler,
    		keyup_handler,
    		click_handler,
    		focus_handler,
    		change_handler_1,
    		input_handler_1,
    		keydown_handler_1,
    		keypress_handler_1,
    		keyup_handler_1,
    		click_handler_1,
    		focus_handler_1,
    		blur_handler_1,
    		change_handler_2,
    		input_handler_2,
    		keydown_handler_2,
    		keypress_handler_2,
    		keyup_handler_2,
    		click_handler_2,
    		blur_handler_2,
    		focus_handler_2,
    		input_input_handler,
    		textarea_1_input_handler,
    		click_handler_3,
    		click_handler_4,
    		$$scope
    	];
    }

    class TextField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$c,
    			create_fragment$c,
    			safe_not_equal,
    			{
    				outlined: 2,
    				value: 0,
    				label: 3,
    				placeholder: 4,
    				hint: 5,
    				error: 6,
    				append: 7,
    				prepend: 8,
    				persistentHint: 31,
    				textarea: 9,
    				rows: 10,
    				select: 11,
    				dense: 12,
    				autocomplete: 13,
    				noUnderline: 14,
    				appendReverse: 15,
    				prependReverse: 16,
    				color: 17,
    				bgColor: 18,
    				iconClass: 19,
    				disabled: 20,
    				add: 32,
    				remove: 33,
    				replace: 34,
    				inputClasses: 35,
    				classes: 36,
    				appendClasses: 37,
    				prependClasses: 38,
    				extend: 39,
    				focused: 1
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextField",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get outlined() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get append() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set append(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prepend() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prepend(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistentHint() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistentHint(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textarea() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textarea(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get select() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set select(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autocomplete() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autocomplete(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noUnderline() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noUnderline(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get appendReverse() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appendReverse(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prependReverse() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prependReverse(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconClass() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconClass(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputClasses() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputClasses(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get appendClasses() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appendClasses(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prependClasses() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prependClasses(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extend() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extend(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focused() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* node_modules\smelte\src\components\Checkbox\Label.svelte generated by Svelte v3.37.0 */
    const file$9 = "node_modules\\smelte\\src\\components\\Checkbox\\Label.svelte";

    // (27:8) {label}
    function fallback_block$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*label*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 1) set_data_dev(t, /*label*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$3.name,
    		type: "fallback",
    		source: "(27:8) {label}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let label_1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);
    	const default_slot_or_fallback = default_slot || fallback_block$3(ctx);
    	let label_1_levels = [{ "aria-hidden": "true" }, /*$$props*/ ctx[2], { class: /*c*/ ctx[1] }];
    	let label_1_data = {};

    	for (let i = 0; i < label_1_levels.length; i += 1) {
    		label_1_data = assign(label_1_data, label_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			set_attributes(label_1, label_1_data);
    			add_location(label_1, file$9, 21, 0, 520);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(label_1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*label*/ 1) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_attributes(label_1, label_1_data = get_spread_update(label_1_levels, [
    				{ "aria-hidden": "true" },
    				dirty & /*$$props*/ 4 && /*$$props*/ ctx[2],
    				(!current || dirty & /*c*/ 2) && { class: /*c*/ ctx[1] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const classesDefault$3 = "pl-2 cursor-pointer 'text-gray-700 dark:text-gray-300'";

    function instance$b($$self, $$props, $$invalidate) {
    	let c;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Label", slots, ['default']);
    	let { classes = classesDefault$3 } = $$props;
    	let { label = "" } = $$props;
    	let { disabled = false } = $$props;
    	let { disabledClasses = "text-gray-500 dark:text-gray-600" } = $$props;
    	const cb = new ClassBuilder(classes, classesDefault$3);

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("classes" in $$new_props) $$invalidate(3, classes = $$new_props.classes);
    		if ("label" in $$new_props) $$invalidate(0, label = $$new_props.label);
    		if ("disabled" in $$new_props) $$invalidate(4, disabled = $$new_props.disabled);
    		if ("disabledClasses" in $$new_props) $$invalidate(5, disabledClasses = $$new_props.disabledClasses);
    		if ("$$scope" in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ClassBuilder,
    		classesDefault: classesDefault$3,
    		classes,
    		label,
    		disabled,
    		disabledClasses,
    		cb,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("classes" in $$props) $$invalidate(3, classes = $$new_props.classes);
    		if ("label" in $$props) $$invalidate(0, label = $$new_props.label);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$new_props.disabled);
    		if ("disabledClasses" in $$props) $$invalidate(5, disabledClasses = $$new_props.disabledClasses);
    		if ("c" in $$props) $$invalidate(1, c = $$new_props.c);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(1, c = cb.flush().add(classes, true, classesDefault$3).add(disabledClasses, disabled).add($$props.class).get());
    	};

    	$$props = exclude_internal_props($$props);
    	return [label, c, $$props, classes, disabled, disabledClasses, $$scope, slots];
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			classes: 3,
    			label: 0,
    			disabled: 4,
    			disabledClasses: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Label",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get classes() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabledClasses() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabledClasses(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\smelte\src\components\Ripple\Ripple.svelte generated by Svelte v3.37.0 */
    const file$8 = "node_modules\\smelte\\src\\components\\Ripple\\Ripple.svelte";

    function create_fragment$a(ctx) {
    	let span;
    	let span_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", span_class_value = "z-40 " + /*$$props*/ ctx[3].class + " p-2 rounded-full flex items-center justify-center top-0 left-0 " + (/*noHover*/ ctx[0] ? "" : /*hoverClass*/ ctx[2]) + " svelte-1o8z87d");
    			add_location(span, file$8, 15, 0, 293);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*ripple*/ ctx[1].call(null, span));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*$$props, noHover, hoverClass*/ 13 && span_class_value !== (span_class_value = "z-40 " + /*$$props*/ ctx[3].class + " p-2 rounded-full flex items-center justify-center top-0 left-0 " + (/*noHover*/ ctx[0] ? "" : /*hoverClass*/ ctx[2]) + " svelte-1o8z87d")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let ripple;
    	let hoverClass;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Ripple", slots, ['default']);
    	let { color = "primary" } = $$props;
    	let { noHover = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("color" in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ("noHover" in $$new_props) $$invalidate(0, noHover = $$new_props.noHover);
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		color,
    		noHover,
    		createRipple: r,
    		ripple,
    		hoverClass
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ("color" in $$props) $$invalidate(4, color = $$new_props.color);
    		if ("noHover" in $$props) $$invalidate(0, noHover = $$new_props.noHover);
    		if ("ripple" in $$props) $$invalidate(1, ripple = $$new_props.ripple);
    		if ("hoverClass" in $$props) $$invalidate(2, hoverClass = $$new_props.hoverClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color*/ 16) {
    			$$invalidate(1, ripple = r(color, true));
    		}

    		if ($$self.$$.dirty & /*color*/ 16) {
    			$$invalidate(2, hoverClass = `hover:bg-${color}-transLight`);
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [noHover, ripple, hoverClass, $$props, color, $$scope, slots];
    }

    class Ripple extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { color: 4, noHover: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ripple",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get color() {
    		throw new Error("<Ripple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Ripple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noHover() {
    		throw new Error("<Ripple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noHover(value) {
    		throw new Error("<Ripple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\smelte\src\components\Checkbox\Checkbox.svelte generated by Svelte v3.37.0 */
    const file$7 = "node_modules\\smelte\\src\\components\\Checkbox\\Checkbox.svelte";
    const get_label_slot_changes = dirty => ({});
    const get_label_slot_context = ctx => ({});

    // (73:8) {:else}
    function create_else_block$1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				class: /*disabled*/ ctx[4]
    				? "text-gray-500 dark:text-gray-600"
    				: "text-gray-600 dark:text-gray-300",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};

    			if (dirty & /*disabled*/ 16) icon_changes.class = /*disabled*/ ctx[4]
    			? "text-gray-500 dark:text-gray-600"
    			: "text-gray-600 dark:text-gray-300";

    			if (dirty & /*$$scope*/ 65536) {
    				icon_changes.$$scope = { dirty, ctx };
    			}

    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(73:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (68:8) {#if checked}
    function create_if_block$4(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				class: /*disabled*/ ctx[4]
    				? "text-gray-500 dark:text-gray-600"
    				: `text-${/*color*/ ctx[3]}-500 dark:text-${/*color*/ ctx[3]}-100`,
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};

    			if (dirty & /*disabled, color*/ 24) icon_changes.class = /*disabled*/ ctx[4]
    			? "text-gray-500 dark:text-gray-600"
    			: `text-${/*color*/ ctx[3]}-500 dark:text-${/*color*/ ctx[3]}-100`;

    			if (dirty & /*$$scope*/ 65536) {
    				icon_changes.$$scope = { dirty, ctx };
    			}

    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(68:8) {#if checked}",
    		ctx
    	});

    	return block;
    }

    // (74:10) <Icon             class={disabled ? 'text-gray-500 dark:text-gray-600' : 'text-gray-600 dark:text-gray-300'}>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("check_box_outline_blank");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(74:10) <Icon             class={disabled ? 'text-gray-500 dark:text-gray-600' : 'text-gray-600 dark:text-gray-300'}>",
    		ctx
    	});

    	return block;
    }

    // (69:10) <Icon             class={disabled ? 'text-gray-500 dark:text-gray-600' : `text-${color}-500 dark:text-${color}-100`}>
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("check_box");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(69:10) <Icon             class={disabled ? 'text-gray-500 dark:text-gray-600' : `text-${color}-500 dark:text-${color}-100`}>",
    		ctx
    	});

    	return block;
    }

    // (67:6) <Ripple color={rippleColor}>
    function create_default_slot$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*checked*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(67:6) <Ripple color={rippleColor}>",
    		ctx
    	});

    	return block;
    }

    // (81:23)        
    function fallback_block$2(ctx) {
    	let label_1;
    	let current;

    	label_1 = new Label({
    			props: {
    				disabled: /*disabled*/ ctx[4],
    				label: /*label*/ ctx[2],
    				class: /*labelClasses*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_1_changes = {};
    			if (dirty & /*disabled*/ 16) label_1_changes.disabled = /*disabled*/ ctx[4];
    			if (dirty & /*label*/ 4) label_1_changes.label = /*label*/ ctx[2];
    			if (dirty & /*labelClasses*/ 32) label_1_changes.class = /*labelClasses*/ ctx[5];
    			label_1.$set(label_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$2.name,
    		type: "fallback",
    		source: "(81:23)        ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div2;
    	let div1;
    	let input;
    	let t0;
    	let div0;
    	let ripple;
    	let t1;
    	let div2_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	ripple = new Ripple({
    			props: {
    				color: /*rippleColor*/ ctx[6],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const label_slot_template = /*#slots*/ ctx[13].label;
    	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[16], get_label_slot_context);
    	const label_slot_or_fallback = label_slot || fallback_block$2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t0 = space();
    			div0 = element("div");
    			create_component(ripple.$$.fragment);
    			t1 = space();
    			if (label_slot_or_fallback) label_slot_or_fallback.c();
    			attr_dev(input, "class", "hidden");
    			attr_dev(input, "type", "checkbox");
    			input.__value = /*value*/ ctx[1];
    			input.value = input.__value;
    			add_location(input, file$7, 64, 4, 1715);
    			attr_dev(div0, "class", "relative w-auto h-auto z-0");
    			add_location(div0, file$7, 65, 4, 1791);
    			attr_dev(div1, "class", /*c*/ ctx[7]);
    			add_location(div1, file$7, 63, 2, 1678);
    			attr_dev(div2, "class", div2_class_value = /*$$props*/ ctx[9].class);
    			add_location(div2, file$7, 62, 0, 1648);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			input.checked = /*checked*/ ctx[0];
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			mount_component(ripple, div0, null);
    			append_dev(div1, t1);

    			if (label_slot_or_fallback) {
    				label_slot_or_fallback.m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[15]),
    					listen_dev(input, "change", /*change_handler*/ ctx[14], false, false, false),
    					listen_dev(div1, "click", /*check*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*value*/ 2) {
    				prop_dev(input, "__value", /*value*/ ctx[1]);
    				input.value = input.__value;
    			}

    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			const ripple_changes = {};
    			if (dirty & /*rippleColor*/ 64) ripple_changes.color = /*rippleColor*/ ctx[6];

    			if (dirty & /*$$scope, disabled, color, checked*/ 65561) {
    				ripple_changes.$$scope = { dirty, ctx };
    			}

    			ripple.$set(ripple_changes);

    			if (label_slot) {
    				if (label_slot.p && dirty & /*$$scope*/ 65536) {
    					update_slot(label_slot, label_slot_template, ctx, /*$$scope*/ ctx[16], dirty, get_label_slot_changes, get_label_slot_context);
    				}
    			} else {
    				if (label_slot_or_fallback && label_slot_or_fallback.p && dirty & /*disabled, label, labelClasses*/ 52) {
    					label_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty & /*c*/ 128) {
    				attr_dev(div1, "class", /*c*/ ctx[7]);
    			}

    			if (!current || dirty & /*$$props*/ 512 && div2_class_value !== (div2_class_value = /*$$props*/ ctx[9].class)) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);
    			transition_in(label_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			transition_out(label_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(ripple);
    			if (label_slot_or_fallback) label_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const classesDefault$2 = "inline-flex items-center mb-2 cursor-pointer z-10";

    function instance$9($$self, $$props, $$invalidate) {
    	let rippleColor;
    	let c;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Checkbox", slots, ['label']);
    	let { value = "" } = $$props;
    	let { label = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { checked = false } = $$props;
    	let { disabled = false } = $$props;
    	let { classes = classesDefault$2 } = $$props;
    	let { labelClasses = i => i } = $$props;
    	let { group = [] } = $$props;

    	// for bind:group
    	//keep track of group array state;
    	let groupstate = group.includes(value);

    	const dispatch = createEventDispatcher();

    	function check() {
    		if (disabled) return;
    		$$invalidate(0, checked = !checked);
    		dispatch("change", checked);
    	}

    	const cb = new ClassBuilder(classes, classesDefault$2);

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(9, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("value" in $$new_props) $$invalidate(1, value = $$new_props.value);
    		if ("label" in $$new_props) $$invalidate(2, label = $$new_props.label);
    		if ("color" in $$new_props) $$invalidate(3, color = $$new_props.color);
    		if ("checked" in $$new_props) $$invalidate(0, checked = $$new_props.checked);
    		if ("disabled" in $$new_props) $$invalidate(4, disabled = $$new_props.disabled);
    		if ("classes" in $$new_props) $$invalidate(11, classes = $$new_props.classes);
    		if ("labelClasses" in $$new_props) $$invalidate(5, labelClasses = $$new_props.labelClasses);
    		if ("group" in $$new_props) $$invalidate(10, group = $$new_props.group);
    		if ("$$scope" in $$new_props) $$invalidate(16, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Label,
    		createEventDispatcher,
    		ClassBuilder,
    		classesDefault: classesDefault$2,
    		Icon,
    		Ripple,
    		value,
    		label,
    		color,
    		checked,
    		disabled,
    		classes,
    		labelClasses,
    		group,
    		groupstate,
    		dispatch,
    		check,
    		cb,
    		rippleColor,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(9, $$props = assign(assign({}, $$props), $$new_props));
    		if ("value" in $$props) $$invalidate(1, value = $$new_props.value);
    		if ("label" in $$props) $$invalidate(2, label = $$new_props.label);
    		if ("color" in $$props) $$invalidate(3, color = $$new_props.color);
    		if ("checked" in $$props) $$invalidate(0, checked = $$new_props.checked);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$new_props.disabled);
    		if ("classes" in $$props) $$invalidate(11, classes = $$new_props.classes);
    		if ("labelClasses" in $$props) $$invalidate(5, labelClasses = $$new_props.labelClasses);
    		if ("group" in $$props) $$invalidate(10, group = $$new_props.group);
    		if ("groupstate" in $$props) $$invalidate(12, groupstate = $$new_props.groupstate);
    		if ("rippleColor" in $$props) $$invalidate(6, rippleColor = $$new_props.rippleColor);
    		if ("c" in $$props) $$invalidate(7, c = $$new_props.c);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value, disabled, group, groupstate, checked*/ 5139) {
    			if (value && !disabled) {
    				const groupHasValue = group.includes(value);

    				// check if group array has changed, or something else
    				if (groupHasValue === groupstate) {
    					// add to group array if checked
    					if (checked && !groupHasValue) {
    						$$invalidate(10, group = group.concat([value]));
    						$$invalidate(12, groupstate = true);
    					} else if (!checked && groupHasValue) {
    						$$invalidate(10, group = [...group.filter(v => v !== value)]); // remove from group array if unchecked
    						$$invalidate(12, groupstate = false);
    					}
    				} else {
    					// group array has changed. Click box
    					$$invalidate(12, groupstate = groupHasValue);

    					check();
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*checked, disabled, color*/ 25) {
    			$$invalidate(6, rippleColor = checked && !disabled ? color : "gray");
    		}

    		$$invalidate(7, c = cb.flush().add(classes, true, classesDefault$2).add($$props.class).get());
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		checked,
    		value,
    		label,
    		color,
    		disabled,
    		labelClasses,
    		rippleColor,
    		c,
    		check,
    		$$props,
    		group,
    		classes,
    		groupstate,
    		slots,
    		change_handler,
    		input_change_handler,
    		$$scope
    	];
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			value: 1,
    			label: 2,
    			color: 3,
    			checked: 0,
    			disabled: 4,
    			classes: 11,
    			labelClasses: 5,
    			group: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkbox",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get value() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClasses() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClasses(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function hideListAction(node, cb) {
      const onWindowClick = e => {
        if (!node.contains(e.target)) {
          cb();
        }
      };

      window.addEventListener("click", onWindowClick);

      return {
        destroy: () => {
          window.removeEventListener("click", onWindowClick);
        }
      };
    }

    /* node_modules\smelte\src\components\Select\Select.svelte generated by Svelte v3.37.0 */
    const file$6 = "node_modules\\smelte\\src\\components\\Select\\Select.svelte";
    const get_options_slot_changes = dirty => ({});
    const get_options_slot_context = ctx => ({});
    const get_select_slot_changes = dirty => ({});
    const get_select_slot_context = ctx => ({});

    // (114:22)      
    function fallback_block_1(ctx) {
    	let textfield;
    	let current;

    	textfield = new TextField({
    			props: {
    				select: true,
    				dense: /*dense*/ ctx[10],
    				focused: /*showList*/ ctx[1],
    				autocomplete: /*autocomplete*/ ctx[12],
    				value: /*selectedLabel*/ ctx[24],
    				outlined: /*outlined*/ ctx[5],
    				label: /*label*/ ctx[3],
    				placeholder: /*placeholder*/ ctx[6],
    				hint: /*hint*/ ctx[7],
    				error: /*error*/ ctx[8],
    				append: /*append*/ ctx[9],
    				persistentHint: /*persistentHint*/ ctx[11],
    				color: /*color*/ ctx[4],
    				add: /*add*/ ctx[21],
    				remove: /*remove*/ ctx[22],
    				replace: /*replace*/ ctx[23],
    				noUnderline: /*noUnderline*/ ctx[13],
    				class: /*inputWrapperClasses*/ ctx[14],
    				appendClasses: /*appendClasses*/ ctx[2],
    				labelClasses: /*labelClasses*/ ctx[15],
    				inputClasses: /*inputClasses*/ ctx[16],
    				prependClasses: /*prependClasses*/ ctx[17],
    				appendReverse: /*showList*/ ctx[1]
    			},
    			$$inline: true
    		});

    	textfield.$on("click", /*handleInputClick*/ ctx[30]);
    	textfield.$on("click-append", /*click_append_handler*/ ctx[41]);
    	textfield.$on("click", /*click_handler*/ ctx[42]);
    	textfield.$on("input", /*filterItems*/ ctx[29]);

    	const block = {
    		c: function create() {
    			create_component(textfield.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};
    			if (dirty[0] & /*dense*/ 1024) textfield_changes.dense = /*dense*/ ctx[10];
    			if (dirty[0] & /*showList*/ 2) textfield_changes.focused = /*showList*/ ctx[1];
    			if (dirty[0] & /*autocomplete*/ 4096) textfield_changes.autocomplete = /*autocomplete*/ ctx[12];
    			if (dirty[0] & /*selectedLabel*/ 16777216) textfield_changes.value = /*selectedLabel*/ ctx[24];
    			if (dirty[0] & /*outlined*/ 32) textfield_changes.outlined = /*outlined*/ ctx[5];
    			if (dirty[0] & /*label*/ 8) textfield_changes.label = /*label*/ ctx[3];
    			if (dirty[0] & /*placeholder*/ 64) textfield_changes.placeholder = /*placeholder*/ ctx[6];
    			if (dirty[0] & /*hint*/ 128) textfield_changes.hint = /*hint*/ ctx[7];
    			if (dirty[0] & /*error*/ 256) textfield_changes.error = /*error*/ ctx[8];
    			if (dirty[0] & /*append*/ 512) textfield_changes.append = /*append*/ ctx[9];
    			if (dirty[0] & /*persistentHint*/ 2048) textfield_changes.persistentHint = /*persistentHint*/ ctx[11];
    			if (dirty[0] & /*color*/ 16) textfield_changes.color = /*color*/ ctx[4];
    			if (dirty[0] & /*add*/ 2097152) textfield_changes.add = /*add*/ ctx[21];
    			if (dirty[0] & /*remove*/ 4194304) textfield_changes.remove = /*remove*/ ctx[22];
    			if (dirty[0] & /*replace*/ 8388608) textfield_changes.replace = /*replace*/ ctx[23];
    			if (dirty[0] & /*noUnderline*/ 8192) textfield_changes.noUnderline = /*noUnderline*/ ctx[13];
    			if (dirty[0] & /*inputWrapperClasses*/ 16384) textfield_changes.class = /*inputWrapperClasses*/ ctx[14];
    			if (dirty[0] & /*appendClasses*/ 4) textfield_changes.appendClasses = /*appendClasses*/ ctx[2];
    			if (dirty[0] & /*labelClasses*/ 32768) textfield_changes.labelClasses = /*labelClasses*/ ctx[15];
    			if (dirty[0] & /*inputClasses*/ 65536) textfield_changes.inputClasses = /*inputClasses*/ ctx[16];
    			if (dirty[0] & /*prependClasses*/ 131072) textfield_changes.prependClasses = /*prependClasses*/ ctx[17];
    			if (dirty[0] & /*showList*/ 2) textfield_changes.appendReverse = /*showList*/ ctx[1];
    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(114:22)      ",
    		ctx
    	});

    	return block;
    }

    // (146:2) {#if showList}
    function create_if_block$3(ctx) {
    	let current;
    	const options_slot_template = /*#slots*/ ctx[40].options;
    	const options_slot = create_slot(options_slot_template, ctx, /*$$scope*/ ctx[39], get_options_slot_context);
    	const options_slot_or_fallback = options_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (options_slot_or_fallback) options_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (options_slot_or_fallback) {
    				options_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (options_slot) {
    				if (options_slot.p && dirty[1] & /*$$scope*/ 256) {
    					update_slot(options_slot, options_slot_template, ctx, /*$$scope*/ ctx[39], dirty, get_options_slot_changes, get_options_slot_context);
    				}
    			} else {
    				if (options_slot_or_fallback && options_slot_or_fallback.p && dirty[0] & /*o, showList, listClasses, selectedClasses, itemClasses, dense, filteredItems, value*/ 169608195) {
    					options_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(options_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(options_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (options_slot_or_fallback) options_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(146:2) {#if showList}",
    		ctx
    	});

    	return block;
    }

    // (147:25)        
    function fallback_block$1(ctx) {
    	let div;
    	let list;
    	let updating_value;
    	let current;
    	let mounted;
    	let dispose;

    	function list_value_binding(value) {
    		/*list_value_binding*/ ctx[43](value);
    	}

    	let list_props = {
    		class: /*listClasses*/ ctx[18],
    		selectedClasses: /*selectedClasses*/ ctx[19],
    		itemClasses: /*itemClasses*/ ctx[20],
    		select: true,
    		dense: /*dense*/ ctx[10],
    		items: /*filteredItems*/ ctx[25]
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		list_props.value = /*value*/ ctx[0];
    	}

    	list = new List({ props: list_props, $$inline: true });
    	binding_callbacks.push(() => bind(list, "value", list_value_binding));
    	list.$on("change", /*change_handler*/ ctx[44]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(list.$$.fragment);
    			attr_dev(div, "class", /*o*/ ctx[27]);
    			add_location(div, file$6, 147, 6, 3663);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(list, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_1*/ ctx[45], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const list_changes = {};
    			if (dirty[0] & /*listClasses*/ 262144) list_changes.class = /*listClasses*/ ctx[18];
    			if (dirty[0] & /*selectedClasses*/ 524288) list_changes.selectedClasses = /*selectedClasses*/ ctx[19];
    			if (dirty[0] & /*itemClasses*/ 1048576) list_changes.itemClasses = /*itemClasses*/ ctx[20];
    			if (dirty[0] & /*dense*/ 1024) list_changes.dense = /*dense*/ ctx[10];
    			if (dirty[0] & /*filteredItems*/ 33554432) list_changes.items = /*filteredItems*/ ctx[25];

    			if (!updating_value && dirty[0] & /*value*/ 1) {
    				updating_value = true;
    				list_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			list.$set(list_changes);

    			if (!current || dirty[0] & /*o*/ 134217728) {
    				attr_dev(div, "class", /*o*/ ctx[27]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(list);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(147:25)        ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const select_slot_template = /*#slots*/ ctx[40].select;
    	const select_slot = create_slot(select_slot_template, ctx, /*$$scope*/ ctx[39], get_select_slot_context);
    	const select_slot_or_fallback = select_slot || fallback_block_1(ctx);
    	let if_block = /*showList*/ ctx[1] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (select_slot_or_fallback) select_slot_or_fallback.c();
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", /*c*/ ctx[26]);
    			add_location(div, file$6, 112, 0, 2929);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (select_slot_or_fallback) {
    				select_slot_or_fallback.m(div, null);
    			}

    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(hideListAction.call(null, div, /*onHideListPanel*/ ctx[31]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (select_slot) {
    				if (select_slot.p && dirty[1] & /*$$scope*/ 256) {
    					update_slot(select_slot, select_slot_template, ctx, /*$$scope*/ ctx[39], dirty, get_select_slot_changes, get_select_slot_context);
    				}
    			} else {
    				if (select_slot_or_fallback && select_slot_or_fallback.p && dirty[0] & /*dense, showList, autocomplete, selectedLabel, outlined, label, placeholder, hint, error, append, persistentHint, color, add, remove, replace, noUnderline, inputWrapperClasses, appendClasses, labelClasses, inputClasses, prependClasses*/ 31719422) {
    					select_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (/*showList*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*showList*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*c*/ 67108864) {
    				attr_dev(div, "class", /*c*/ ctx[26]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select_slot_or_fallback, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select_slot_or_fallback, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (select_slot_or_fallback) select_slot_or_fallback.d(detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const optionsClassesDefault = "absolute left-0 bg-white rounded shadow w-full z-20 dark:bg-dark-500";
    const classesDefault$1 = "cursor-pointer relative pb-4";

    function process(it) {
    	return it.map(i => typeof i !== "object" ? { value: i, text: i } : i);
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let filteredItems;
    	let c;
    	let o;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Select", slots, ['select','options']);
    	const noop = i => i;
    	let { items = [] } = $$props;
    	let { value = "" } = $$props;
    	const text = "";
    	let { label = "" } = $$props;
    	let { selectedLabel: selectedLabelProp = undefined } = $$props;
    	let { color = "primary" } = $$props;
    	let { outlined = false } = $$props;
    	let { placeholder = "" } = $$props;
    	let { hint = "" } = $$props;
    	let { error = false } = $$props;
    	let { append = "arrow_drop_down" } = $$props;
    	let { dense = false } = $$props;
    	let { persistentHint = false } = $$props;
    	let { autocomplete = false } = $$props;
    	let { noUnderline = false } = $$props;
    	let { showList = false } = $$props;
    	let { classes = classesDefault$1 } = $$props;
    	let { optionsClasses = optionsClassesDefault } = $$props;
    	let { inputWrapperClasses = noop } = $$props;
    	let { appendClasses = noop } = $$props;
    	let { labelClasses = noop } = $$props;
    	let { inputClasses = noop } = $$props;
    	let { prependClasses = noop } = $$props;
    	let { listClasses = noop } = $$props;
    	let { selectedClasses = noop } = $$props;
    	let { itemClasses = noop } = $$props;
    	let { add = "" } = $$props;
    	let { remove = "" } = $$props;
    	let { replace = "" } = $$props;
    	let itemsProcessed = [];
    	const dispatch = createEventDispatcher();
    	let selectedLabel = "";
    	let filterText = null;

    	function filterItems({ target }) {
    		$$invalidate(38, filterText = target.value.toLowerCase());
    	}

    	function handleInputClick() {
    		if (autocomplete) {
    			$$invalidate(1, showList = true);
    		} else {
    			$$invalidate(1, showList = !showList);
    		}
    	}

    	const onHideListPanel = () => $$invalidate(1, showList = false);
    	const cb = new ClassBuilder(classes, classesDefault$1);
    	const ocb = new ClassBuilder(optionsClasses, optionsClassesDefault);
    	const click_append_handler = e => $$invalidate(1, showList = !showList);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function list_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	const change_handler = ({ detail }) => {
    		dispatch("change", detail);
    	};

    	const click_handler_1 = () => $$invalidate(1, showList = false);

    	$$self.$$set = $$new_props => {
    		$$invalidate(49, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("items" in $$new_props) $$invalidate(32, items = $$new_props.items);
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("label" in $$new_props) $$invalidate(3, label = $$new_props.label);
    		if ("selectedLabel" in $$new_props) $$invalidate(34, selectedLabelProp = $$new_props.selectedLabel);
    		if ("color" in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ("outlined" in $$new_props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ("placeholder" in $$new_props) $$invalidate(6, placeholder = $$new_props.placeholder);
    		if ("hint" in $$new_props) $$invalidate(7, hint = $$new_props.hint);
    		if ("error" in $$new_props) $$invalidate(8, error = $$new_props.error);
    		if ("append" in $$new_props) $$invalidate(9, append = $$new_props.append);
    		if ("dense" in $$new_props) $$invalidate(10, dense = $$new_props.dense);
    		if ("persistentHint" in $$new_props) $$invalidate(11, persistentHint = $$new_props.persistentHint);
    		if ("autocomplete" in $$new_props) $$invalidate(12, autocomplete = $$new_props.autocomplete);
    		if ("noUnderline" in $$new_props) $$invalidate(13, noUnderline = $$new_props.noUnderline);
    		if ("showList" in $$new_props) $$invalidate(1, showList = $$new_props.showList);
    		if ("classes" in $$new_props) $$invalidate(35, classes = $$new_props.classes);
    		if ("optionsClasses" in $$new_props) $$invalidate(36, optionsClasses = $$new_props.optionsClasses);
    		if ("inputWrapperClasses" in $$new_props) $$invalidate(14, inputWrapperClasses = $$new_props.inputWrapperClasses);
    		if ("appendClasses" in $$new_props) $$invalidate(2, appendClasses = $$new_props.appendClasses);
    		if ("labelClasses" in $$new_props) $$invalidate(15, labelClasses = $$new_props.labelClasses);
    		if ("inputClasses" in $$new_props) $$invalidate(16, inputClasses = $$new_props.inputClasses);
    		if ("prependClasses" in $$new_props) $$invalidate(17, prependClasses = $$new_props.prependClasses);
    		if ("listClasses" in $$new_props) $$invalidate(18, listClasses = $$new_props.listClasses);
    		if ("selectedClasses" in $$new_props) $$invalidate(19, selectedClasses = $$new_props.selectedClasses);
    		if ("itemClasses" in $$new_props) $$invalidate(20, itemClasses = $$new_props.itemClasses);
    		if ("add" in $$new_props) $$invalidate(21, add = $$new_props.add);
    		if ("remove" in $$new_props) $$invalidate(22, remove = $$new_props.remove);
    		if ("replace" in $$new_props) $$invalidate(23, replace = $$new_props.replace);
    		if ("$$scope" in $$new_props) $$invalidate(39, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		quadOut,
    		quadIn,
    		List,
    		TextField,
    		ClassBuilder,
    		hideListAction,
    		optionsClassesDefault,
    		classesDefault: classesDefault$1,
    		noop,
    		items,
    		value,
    		text,
    		label,
    		selectedLabelProp,
    		color,
    		outlined,
    		placeholder,
    		hint,
    		error,
    		append,
    		dense,
    		persistentHint,
    		autocomplete,
    		noUnderline,
    		showList,
    		classes,
    		optionsClasses,
    		inputWrapperClasses,
    		appendClasses,
    		labelClasses,
    		inputClasses,
    		prependClasses,
    		listClasses,
    		selectedClasses,
    		itemClasses,
    		add,
    		remove,
    		replace,
    		itemsProcessed,
    		process,
    		dispatch,
    		selectedLabel,
    		filterText,
    		filterItems,
    		handleInputClick,
    		onHideListPanel,
    		cb,
    		ocb,
    		filteredItems,
    		c,
    		o
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(49, $$props = assign(assign({}, $$props), $$new_props));
    		if ("items" in $$props) $$invalidate(32, items = $$new_props.items);
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("label" in $$props) $$invalidate(3, label = $$new_props.label);
    		if ("selectedLabelProp" in $$props) $$invalidate(34, selectedLabelProp = $$new_props.selectedLabelProp);
    		if ("color" in $$props) $$invalidate(4, color = $$new_props.color);
    		if ("outlined" in $$props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ("placeholder" in $$props) $$invalidate(6, placeholder = $$new_props.placeholder);
    		if ("hint" in $$props) $$invalidate(7, hint = $$new_props.hint);
    		if ("error" in $$props) $$invalidate(8, error = $$new_props.error);
    		if ("append" in $$props) $$invalidate(9, append = $$new_props.append);
    		if ("dense" in $$props) $$invalidate(10, dense = $$new_props.dense);
    		if ("persistentHint" in $$props) $$invalidate(11, persistentHint = $$new_props.persistentHint);
    		if ("autocomplete" in $$props) $$invalidate(12, autocomplete = $$new_props.autocomplete);
    		if ("noUnderline" in $$props) $$invalidate(13, noUnderline = $$new_props.noUnderline);
    		if ("showList" in $$props) $$invalidate(1, showList = $$new_props.showList);
    		if ("classes" in $$props) $$invalidate(35, classes = $$new_props.classes);
    		if ("optionsClasses" in $$props) $$invalidate(36, optionsClasses = $$new_props.optionsClasses);
    		if ("inputWrapperClasses" in $$props) $$invalidate(14, inputWrapperClasses = $$new_props.inputWrapperClasses);
    		if ("appendClasses" in $$props) $$invalidate(2, appendClasses = $$new_props.appendClasses);
    		if ("labelClasses" in $$props) $$invalidate(15, labelClasses = $$new_props.labelClasses);
    		if ("inputClasses" in $$props) $$invalidate(16, inputClasses = $$new_props.inputClasses);
    		if ("prependClasses" in $$props) $$invalidate(17, prependClasses = $$new_props.prependClasses);
    		if ("listClasses" in $$props) $$invalidate(18, listClasses = $$new_props.listClasses);
    		if ("selectedClasses" in $$props) $$invalidate(19, selectedClasses = $$new_props.selectedClasses);
    		if ("itemClasses" in $$props) $$invalidate(20, itemClasses = $$new_props.itemClasses);
    		if ("add" in $$props) $$invalidate(21, add = $$new_props.add);
    		if ("remove" in $$props) $$invalidate(22, remove = $$new_props.remove);
    		if ("replace" in $$props) $$invalidate(23, replace = $$new_props.replace);
    		if ("itemsProcessed" in $$props) $$invalidate(37, itemsProcessed = $$new_props.itemsProcessed);
    		if ("selectedLabel" in $$props) $$invalidate(24, selectedLabel = $$new_props.selectedLabel);
    		if ("filterText" in $$props) $$invalidate(38, filterText = $$new_props.filterText);
    		if ("filteredItems" in $$props) $$invalidate(25, filteredItems = $$new_props.filteredItems);
    		if ("c" in $$props) $$invalidate(26, c = $$new_props.c);
    		if ("o" in $$props) $$invalidate(27, o = $$new_props.o);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[1] & /*items*/ 2) {
    			$$invalidate(37, itemsProcessed = process(items));
    		}

    		if ($$self.$$.dirty[0] & /*value*/ 1 | $$self.$$.dirty[1] & /*selectedLabelProp, itemsProcessed*/ 72) {
    			{
    				if (selectedLabelProp !== undefined) {
    					$$invalidate(24, selectedLabel = selectedLabelProp);
    				} else if (value !== undefined) {
    					let selectedItem = itemsProcessed.find(i => i.value === value);
    					$$invalidate(24, selectedLabel = selectedItem ? selectedItem.text : "");
    				} else {
    					$$invalidate(24, selectedLabel = "");
    				}
    			}
    		}

    		if ($$self.$$.dirty[1] & /*itemsProcessed, filterText*/ 192) {
    			$$invalidate(25, filteredItems = itemsProcessed.filter(i => !filterText || i.text.toLowerCase().includes(filterText)));
    		}

    		$$invalidate(26, c = cb.flush().add(classes, true, classesDefault$1).add($$props.class).get());

    		if ($$self.$$.dirty[0] & /*outlined*/ 32 | $$self.$$.dirty[1] & /*optionsClasses*/ 32) {
    			$$invalidate(27, o = ocb.flush().add(optionsClasses, true, optionsClassesDefault).add("rounded-t-none", !outlined).get());
    		}

    		if ($$self.$$.dirty[0] & /*dense*/ 1024) {
    			if (dense) {
    				$$invalidate(2, appendClasses = i => i.replace("pt-4", "pt-3"));
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		showList,
    		appendClasses,
    		label,
    		color,
    		outlined,
    		placeholder,
    		hint,
    		error,
    		append,
    		dense,
    		persistentHint,
    		autocomplete,
    		noUnderline,
    		inputWrapperClasses,
    		labelClasses,
    		inputClasses,
    		prependClasses,
    		listClasses,
    		selectedClasses,
    		itemClasses,
    		add,
    		remove,
    		replace,
    		selectedLabel,
    		filteredItems,
    		c,
    		o,
    		dispatch,
    		filterItems,
    		handleInputClick,
    		onHideListPanel,
    		items,
    		text,
    		selectedLabelProp,
    		classes,
    		optionsClasses,
    		itemsProcessed,
    		filterText,
    		$$scope,
    		slots,
    		click_append_handler,
    		click_handler,
    		list_value_binding,
    		change_handler,
    		click_handler_1
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$8,
    			create_fragment$8,
    			safe_not_equal,
    			{
    				items: 32,
    				value: 0,
    				text: 33,
    				label: 3,
    				selectedLabel: 34,
    				color: 4,
    				outlined: 5,
    				placeholder: 6,
    				hint: 7,
    				error: 8,
    				append: 9,
    				dense: 10,
    				persistentHint: 11,
    				autocomplete: 12,
    				noUnderline: 13,
    				showList: 1,
    				classes: 35,
    				optionsClasses: 36,
    				inputWrapperClasses: 14,
    				appendClasses: 2,
    				labelClasses: 15,
    				inputClasses: 16,
    				prependClasses: 17,
    				listClasses: 18,
    				selectedClasses: 19,
    				itemClasses: 20,
    				add: 21,
    				remove: 22,
    				replace: 23
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get items() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		return this.$$.ctx[33];
    	}

    	set text(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get append() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set append(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistentHint() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistentHint(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autocomplete() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autocomplete(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noUnderline() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noUnderline(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showList() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showList(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionsClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionsClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputWrapperClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputWrapperClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get appendClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appendClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prependClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prependClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\smelte\src\components\ProgressCircular\ProgressCircular.svelte generated by Svelte v3.37.0 */

    const file$5 = "node_modules\\smelte\\src\\components\\ProgressCircular\\ProgressCircular.svelte";

    function create_fragment$7(ctx) {
    	let svg;
    	let circle;
    	let circle_class_value;
    	let circle_cx_value;
    	let circle_cy_value;
    	let circle_r_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			attr_dev(circle, "class", circle_class_value = "path stroke-" + /*color*/ ctx[0] + " svelte-1xkiyez");
    			attr_dev(circle, "cx", circle_cx_value = /*size*/ ctx[2] / 2);
    			attr_dev(circle, "cy", circle_cy_value = /*size*/ ctx[2] / 2);
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "r", circle_r_value = /*size*/ ctx[2] / 2 - /*size*/ ctx[2] / 5);
    			attr_dev(circle, "stroke-width", /*width*/ ctx[1]);
    			attr_dev(circle, "stroke-miterlimit", "10");
    			attr_dev(circle, "style", /*style*/ ctx[3]);
    			add_location(circle, file$5, 49, 2, 960);
    			attr_dev(svg, "class", "circular svelte-1xkiyez");
    			set_style(svg, "width", /*size*/ ctx[2] + "px");
    			set_style(svg, "height", /*size*/ ctx[2] + "px");
    			add_location(svg, file$5, 48, 0, 892);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, circle);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 1 && circle_class_value !== (circle_class_value = "path stroke-" + /*color*/ ctx[0] + " svelte-1xkiyez")) {
    				attr_dev(circle, "class", circle_class_value);
    			}

    			if (dirty & /*size*/ 4 && circle_cx_value !== (circle_cx_value = /*size*/ ctx[2] / 2)) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*size*/ 4 && circle_cy_value !== (circle_cy_value = /*size*/ ctx[2] / 2)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*size*/ 4 && circle_r_value !== (circle_r_value = /*size*/ ctx[2] / 2 - /*size*/ ctx[2] / 5)) {
    				attr_dev(circle, "r", circle_r_value);
    			}

    			if (dirty & /*width*/ 2) {
    				attr_dev(circle, "stroke-width", /*width*/ ctx[1]);
    			}

    			if (dirty & /*style*/ 8) {
    				attr_dev(circle, "style", /*style*/ ctx[3]);
    			}

    			if (dirty & /*size*/ 4) {
    				set_style(svg, "width", /*size*/ ctx[2] + "px");
    			}

    			if (dirty & /*size*/ 4) {
    				set_style(svg, "height", /*size*/ ctx[2] + "px");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let style;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProgressCircular", slots, []);
    	let { progress = null } = $$props;
    	let { color = "primary" } = $$props;
    	let { width = 3 } = $$props;
    	let { size = 70 } = $$props;
    	const writable_props = ["progress", "color", "width", "size"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProgressCircular> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("progress" in $$props) $$invalidate(4, progress = $$props.progress);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("size" in $$props) $$invalidate(2, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({ progress, color, width, size, style });

    	$$self.$inject_state = $$props => {
    		if ("progress" in $$props) $$invalidate(4, progress = $$props.progress);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("size" in $$props) $$invalidate(2, size = $$props.size);
    		if ("style" in $$props) $$invalidate(3, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*progress*/ 16) {
    			$$invalidate(3, style = progress > 0
    			? `
      animation: none;
      stroke-dasharray: ${150000 - progress * 1000};
      stroke-dashoffset: -${124 - progress * 124 / 100};
    `
    			: "");
    		}
    	};

    	return [color, width, size, style, progress];
    }

    class ProgressCircular extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { progress: 4, color: 0, width: 1, size: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProgressCircular",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get progress() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progress(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<ProgressCircular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<ProgressCircular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\smelte\src\components\Slider\Slider.svelte generated by Svelte v3.37.0 */
    const file$4 = "node_modules\\smelte\\src\\components\\Slider\\Slider.svelte";

    function create_fragment$6(ctx) {
    	let label_1;
    	let t0;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = space();
    			input = element("input");
    			add_location(label_1, file$4, 53, 0, 1244);
    			attr_dev(input, "type", "range");
    			attr_dev(input, "class", /*c*/ ctx[7]);
    			attr_dev(input, "min", /*min*/ ctx[3]);
    			attr_dev(input, "max", /*max*/ ctx[4]);
    			attr_dev(input, "step", /*step*/ ctx[5]);
    			input.disabled = /*disabled*/ ctx[2];
    			attr_dev(input, "style", /*style*/ ctx[6]);
    			add_location(input, file$4, 54, 0, 1267);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*applyColor*/ ctx[8].call(null, input)),
    					listen_dev(input, "change", /*input_change_input_handler*/ ctx[13]),
    					listen_dev(input, "input", /*input_change_input_handler*/ ctx[13]),
    					listen_dev(input, "change", /*change_handler*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (dirty & /*c*/ 128) {
    				attr_dev(input, "class", /*c*/ ctx[7]);
    			}

    			if (dirty & /*min*/ 8) {
    				attr_dev(input, "min", /*min*/ ctx[3]);
    			}

    			if (dirty & /*max*/ 16) {
    				attr_dev(input, "max", /*max*/ ctx[4]);
    			}

    			if (dirty & /*step*/ 32) {
    				attr_dev(input, "step", /*step*/ ctx[5]);
    			}

    			if (dirty & /*disabled*/ 4) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[2]);
    			}

    			if (dirty & /*style*/ 64) {
    				attr_dev(input, "style", /*style*/ ctx[6]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let c;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Slider", slots, []);
    	let { value = 0 } = $$props;
    	let { label = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { disabled = false } = $$props;
    	let { min = 0 } = $$props;
    	let { max = 100 } = $$props;
    	let { step = null } = $$props;
    	const classesDefault = `bg-${color}-50 w-full rounded cursor-pointer`;
    	let { classes = classesDefault } = $$props;
    	let toPercent;
    	const cb = new ClassBuilder(classes, classesDefault);
    	const getColor = c => `var(${c})`;
    	let style;

    	function applyColor(node) {
    		if (typeof window === "undefined") return false;
    		let c = getColor(`--color-${color}-500`);
    		node.style.setProperty("--bg", c);
    		node.style.setProperty("--bg-focus", c);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_change_input_handler() {
    		value = to_number(this.value);
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("label" in $$new_props) $$invalidate(1, label = $$new_props.label);
    		if ("color" in $$new_props) $$invalidate(9, color = $$new_props.color);
    		if ("disabled" in $$new_props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("min" in $$new_props) $$invalidate(3, min = $$new_props.min);
    		if ("max" in $$new_props) $$invalidate(4, max = $$new_props.max);
    		if ("step" in $$new_props) $$invalidate(5, step = $$new_props.step);
    		if ("classes" in $$new_props) $$invalidate(10, classes = $$new_props.classes);
    	};

    	$$self.$capture_state = () => ({
    		ClassBuilder,
    		Ripple,
    		value,
    		label,
    		color,
    		disabled,
    		min,
    		max,
    		step,
    		classesDefault,
    		classes,
    		toPercent,
    		cb,
    		getColor,
    		style,
    		applyColor,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), $$new_props));
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("label" in $$props) $$invalidate(1, label = $$new_props.label);
    		if ("color" in $$props) $$invalidate(9, color = $$new_props.color);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("min" in $$props) $$invalidate(3, min = $$new_props.min);
    		if ("max" in $$props) $$invalidate(4, max = $$new_props.max);
    		if ("step" in $$props) $$invalidate(5, step = $$new_props.step);
    		if ("classes" in $$props) $$invalidate(10, classes = $$new_props.classes);
    		if ("toPercent" in $$props) $$invalidate(11, toPercent = $$new_props.toPercent);
    		if ("style" in $$props) $$invalidate(6, style = $$new_props.style);
    		if ("c" in $$props) $$invalidate(7, c = $$new_props.c);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*max, min*/ 24) {
    			{
    				let factor = 100 / (max - min);
    				$$invalidate(11, toPercent = v => (v - min) * factor);
    			}
    		}

    		$$invalidate(7, c = cb.flush().add(classes, true, classesDefault).add($$props.class).get());

    		if ($$self.$$.dirty & /*color, toPercent, value, disabled*/ 2565) {
    			{
    				let c1 = getColor(`--color-${color}-500`);
    				let c2 = getColor(`--color-${color}-200`);
    				let cv = toPercent(value);

    				$$invalidate(6, style = disabled
    				? ""
    				: `background: linear-gradient(to right, ${c1} 0%, ${c1} ${cv}%, ${c2} ${cv}%, ${c2} 100%); --bg: ${c1}; --bg-focus: ${c1}`);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		label,
    		disabled,
    		min,
    		max,
    		step,
    		style,
    		c,
    		applyColor,
    		color,
    		classes,
    		toPercent,
    		change_handler,
    		input_change_input_handler
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			value: 0,
    			label: 1,
    			color: 9,
    			disabled: 2,
    			min: 3,
    			max: 4,
    			step: 5,
    			classes: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get value() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get min() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\smelte\src\components\Snackbar\Snackbar.svelte generated by Svelte v3.37.0 */
    const file$3 = "node_modules\\smelte\\src\\components\\Snackbar\\Snackbar.svelte";
    const get_action_slot_changes = dirty => ({});
    const get_action_slot_context = ctx => ({});

    // (112:0) {#if value && (running === hash)}
    function create_if_block$2(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t;
    	let div0_intro;
    	let div0_outro;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[24], null);
    	let if_block = !/*noAction*/ ctx[5] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			add_location(div0, file$3, 116, 6, 2705);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*wClasses*/ ctx[7]) + " svelte-1ym8qvd"));
    			add_location(div1, file$3, 115, 4, 2676);
    			attr_dev(div2, "class", "fixed w-full h-full top-0 left-0 z-30 pointer-events-none");
    			add_location(div2, file$3, 112, 2, 2593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div0, t);
    			if (if_block) if_block.m(div0, null);
    			/*div0_binding*/ ctx[22](div0);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler_1*/ ctx[23], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16777216) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[24], dirty, null, null);
    				}
    			}

    			if (!/*noAction*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*noAction*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*wClasses*/ 128 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*wClasses*/ ctx[7]) + " svelte-1ym8qvd"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (div0_outro) div0_outro.end(1);
    				if (!div0_intro) div0_intro = create_in_transition(div0, scale, /*inProps*/ ctx[3]);
    				div0_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block);
    			if (div0_intro) div0_intro.invalidate();
    			div0_outro = create_out_transition(div0, fade, /*outProps*/ ctx[4]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block) if_block.d();
    			/*div0_binding*/ ctx[22](null);
    			if (detaching && div0_outro) div0_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(112:0) {#if value && (running === hash)}",
    		ctx
    	});

    	return block;
    }

    // (123:8) {#if !noAction}
    function create_if_block_1$1(ctx) {
    	let spacer;
    	let t;
    	let current;
    	spacer = new Spacer({ $$inline: true });
    	const action_slot_template = /*#slots*/ ctx[20].action;
    	const action_slot = create_slot(action_slot_template, ctx, /*$$scope*/ ctx[24], get_action_slot_context);
    	const action_slot_or_fallback = action_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			create_component(spacer.$$.fragment);
    			t = space();
    			if (action_slot_or_fallback) action_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			mount_component(spacer, target, anchor);
    			insert_dev(target, t, anchor);

    			if (action_slot_or_fallback) {
    				action_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (action_slot) {
    				if (action_slot.p && dirty & /*$$scope*/ 16777216) {
    					update_slot(action_slot, action_slot_template, ctx, /*$$scope*/ ctx[24], dirty, get_action_slot_changes, get_action_slot_context);
    				}
    			} else {
    				if (action_slot_or_fallback && action_slot_or_fallback.p && dirty & /*value, timeout*/ 5) {
    					action_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spacer.$$.fragment, local);
    			transition_in(action_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spacer.$$.fragment, local);
    			transition_out(action_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spacer, detaching);
    			if (detaching) detach_dev(t);
    			if (action_slot_or_fallback) action_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(123:8) {#if !noAction}",
    		ctx
    	});

    	return block;
    }

    // (126:12) {#if !timeout}
    function create_if_block_2(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				text: true,
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[21]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 16777216) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(126:12) {#if !timeout}",
    		ctx
    	});

    	return block;
    }

    // (127:14) <Button text on:click={() => value = false}>
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Close");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(127:14) <Button text on:click={() => value = false}>",
    		ctx
    	});

    	return block;
    }

    // (125:30)              
    function fallback_block(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = !/*timeout*/ ctx[2] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!/*timeout*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*timeout*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(125:30)              ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*value*/ ctx[0] && running === /*hash*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*value*/ ctx[0] && running === /*hash*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*value, running, hash*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const queue = writable([]);
    let running = false;
    const wrapperDefault = "fixed w-full h-full flex items-center justify-center pointer-events-none";

    function instance$5($$self, $$props, $$invalidate) {
    	let toggler;
    	let c;
    	let $queue;
    	validate_store(queue, "queue");
    	component_subscribe($$self, queue, $$value => $$invalidate(18, $queue = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Snackbar", slots, ['default','action']);
    	let { value = false } = $$props;
    	let { timeout = 2000 } = $$props;
    	let { inProps = { duration: 100, easing: quadIn } } = $$props;

    	let { outProps = {
    		duration: 100,
    		easing: quadOut,
    		delay: 150
    	} } = $$props;

    	let { color = "gray" } = $$props;
    	let { text = "white" } = $$props;
    	let { top = false } = $$props;
    	let { bottom = true } = $$props;
    	let { right = false } = $$props;
    	let { left = false } = $$props;
    	let { noAction = true } = $$props;
    	let { hash = false } = $$props;
    	const dispatch = createEventDispatcher();

    	const classesDefault = `pointer-events-auto flex absolute py-2 px-4 z-30 mb-4 content-between mx-auto
      rounded items-center shadow-sm h-12`;

    	let { classes = wrapperDefault } = $$props;
    	const cb = new ClassBuilder($$props.class, classesDefault);
    	const wrapperCb = new ClassBuilder(classes, wrapperDefault);
    	let wClasses = i => i;
    	let tm;
    	let node;

    	let bg = () => {
    		
    	};

    	function toggle(h, id) {
    		if (value === false && running === false) {
    			return;
    		}

    		$$invalidate(1, hash = running = $$invalidate(0, value = id));
    		if (!timeout) return;

    		$$invalidate(15, tm = setTimeout(
    			() => {
    				$$invalidate(0, value = running = $$invalidate(1, hash = false));
    				dispatch("finish");

    				if ($queue.length) {
    					$queue.shift()();
    				}
    			},
    			timeout
    		));
    	}

    	wClasses = wrapperCb.flush().add(`text-${text}`).get();
    	const click_handler = () => $$invalidate(0, value = false);

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			node = $$value;
    			(((((((($$invalidate(6, node), $$invalidate(19, c)), $$invalidate(16, bg)), $$invalidate(8, color)), $$invalidate(12, right)), $$invalidate(10, top)), $$invalidate(13, left)), $$invalidate(11, bottom)), $$invalidate(5, noAction));
    		});
    	}

    	const click_handler_1 = () => $$invalidate(0, value = false);

    	$$self.$$set = $$new_props => {
    		$$invalidate(30, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("timeout" in $$new_props) $$invalidate(2, timeout = $$new_props.timeout);
    		if ("inProps" in $$new_props) $$invalidate(3, inProps = $$new_props.inProps);
    		if ("outProps" in $$new_props) $$invalidate(4, outProps = $$new_props.outProps);
    		if ("color" in $$new_props) $$invalidate(8, color = $$new_props.color);
    		if ("text" in $$new_props) $$invalidate(9, text = $$new_props.text);
    		if ("top" in $$new_props) $$invalidate(10, top = $$new_props.top);
    		if ("bottom" in $$new_props) $$invalidate(11, bottom = $$new_props.bottom);
    		if ("right" in $$new_props) $$invalidate(12, right = $$new_props.right);
    		if ("left" in $$new_props) $$invalidate(13, left = $$new_props.left);
    		if ("noAction" in $$new_props) $$invalidate(5, noAction = $$new_props.noAction);
    		if ("hash" in $$new_props) $$invalidate(1, hash = $$new_props.hash);
    		if ("classes" in $$new_props) $$invalidate(14, classes = $$new_props.classes);
    		if ("$$scope" in $$new_props) $$invalidate(24, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		queue,
    		running,
    		fade,
    		scale,
    		createEventDispatcher,
    		quadOut,
    		quadIn,
    		Button,
    		Spacer,
    		utils,
    		ClassBuilder,
    		value,
    		timeout,
    		inProps,
    		outProps,
    		color,
    		text,
    		top,
    		bottom,
    		right,
    		left,
    		noAction,
    		hash,
    		dispatch,
    		classesDefault,
    		wrapperDefault,
    		classes,
    		cb,
    		wrapperCb,
    		wClasses,
    		tm,
    		node,
    		bg,
    		toggle,
    		toggler,
    		$queue,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(30, $$props = assign(assign({}, $$props), $$new_props));
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("timeout" in $$props) $$invalidate(2, timeout = $$new_props.timeout);
    		if ("inProps" in $$props) $$invalidate(3, inProps = $$new_props.inProps);
    		if ("outProps" in $$props) $$invalidate(4, outProps = $$new_props.outProps);
    		if ("color" in $$props) $$invalidate(8, color = $$new_props.color);
    		if ("text" in $$props) $$invalidate(9, text = $$new_props.text);
    		if ("top" in $$props) $$invalidate(10, top = $$new_props.top);
    		if ("bottom" in $$props) $$invalidate(11, bottom = $$new_props.bottom);
    		if ("right" in $$props) $$invalidate(12, right = $$new_props.right);
    		if ("left" in $$props) $$invalidate(13, left = $$new_props.left);
    		if ("noAction" in $$props) $$invalidate(5, noAction = $$new_props.noAction);
    		if ("hash" in $$props) $$invalidate(1, hash = $$new_props.hash);
    		if ("classes" in $$props) $$invalidate(14, classes = $$new_props.classes);
    		if ("wClasses" in $$props) $$invalidate(7, wClasses = $$new_props.wClasses);
    		if ("tm" in $$props) $$invalidate(15, tm = $$new_props.tm);
    		if ("node" in $$props) $$invalidate(6, node = $$new_props.node);
    		if ("bg" in $$props) $$invalidate(16, bg = $$new_props.bg);
    		if ("toggler" in $$props) $$invalidate(17, toggler = $$new_props.toggler);
    		if ("c" in $$props) $$invalidate(19, c = $$new_props.c);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color*/ 256) {
    			{
    				const u = utils(color || "gray");
    				$$invalidate(16, bg = u.bg);
    			}
    		}

    		if ($$self.$$.dirty & /*hash, value*/ 3) {
    			{
    				$$invalidate(1, hash = hash || (value ? btoa(`${value}${new Date().valueOf()}`) : null));
    				($$invalidate(0, value), $$invalidate(1, hash));
    			}
    		}

    		if ($$self.$$.dirty & /*value, hash*/ 3) {
    			$$invalidate(17, toggler = () => toggle(value, hash));
    		}

    		if ($$self.$$.dirty & /*value, toggler*/ 131073) {
    			if (value) {
    				queue.update(u => [...u, toggler]);
    			}
    		}

    		if ($$self.$$.dirty & /*value, $queue*/ 262145) {
    			if (!running && value && $queue.length) {
    				$queue.shift()();
    			}
    		}

    		if ($$self.$$.dirty & /*value, tm*/ 32769) {
    			if (!value) clearTimeout(tm);
    		}

    		if ($$self.$$.dirty & /*bg, color, right, top, left, bottom, noAction*/ 81184) {
    			$$invalidate(19, c = cb.flush().add(bg(800), color).add("right-0 mr-2", right).add("top-0 mt-2", top).add("left-0 ml-2", left).add("bottom-0", bottom).add("snackbar", !noAction).get());
    		}

    		if ($$self.$$.dirty & /*node, c*/ 524352) {
    			// for some reason it doesn't get updated otherwise
    			if (node) $$invalidate(6, node.classList = c, node);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		hash,
    		timeout,
    		inProps,
    		outProps,
    		noAction,
    		node,
    		wClasses,
    		color,
    		text,
    		top,
    		bottom,
    		right,
    		left,
    		classes,
    		tm,
    		bg,
    		toggler,
    		$queue,
    		c,
    		slots,
    		click_handler,
    		div0_binding,
    		click_handler_1,
    		$$scope
    	];
    }

    class Snackbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			value: 0,
    			timeout: 2,
    			inProps: 3,
    			outProps: 4,
    			color: 8,
    			text: 9,
    			top: 10,
    			bottom: 11,
    			right: 12,
    			left: 13,
    			noAction: 5,
    			hash: 1,
    			classes: 14
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Snackbar",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get value() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get timeout() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set timeout(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inProps() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inProps(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outProps() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outProps(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get top() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get left() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set left(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noAction() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noAction(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hash() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hash(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Snackbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Snackbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\smelte\src\components\Tooltip\Tooltip.svelte generated by Svelte v3.37.0 */
    const file$2 = "node_modules\\smelte\\src\\components\\Tooltip\\Tooltip.svelte";
    const get_activator_slot_changes = dirty => ({});
    const get_activator_slot_context = ctx => ({});

    // (78:2) {#if show}
    function create_if_block$1(ctx) {
    	let div;
    	let div_class_value;
    	let div_intro;
    	let div_outro;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*c*/ ctx[3]) + " svelte-1n6auy7"));
    			add_location(div, file$2, 78, 4, 1636);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*c*/ 8 && div_class_value !== (div_class_value = "" + (null_to_empty(/*c*/ ctx[3]) + " svelte-1n6auy7"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, scale, { duration: 150 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, scale, { duration: 150, delay: 100 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(78:2) {#if show}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const activator_slot_template = /*#slots*/ ctx[9].activator;
    	const activator_slot = create_slot(activator_slot_template, ctx, /*$$scope*/ ctx[8], get_activator_slot_context);
    	let if_block = /*show*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (activator_slot) activator_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			add_location(div0, file$2, 66, 2, 1395);
    			attr_dev(div1, "class", "relative inline-block");
    			add_location(div1, file$2, 65, 0, 1357);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (activator_slot) {
    				activator_slot.m(div0, null);
    			}

    			append_dev(div1, t);
    			if (if_block) if_block.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						div0,
    						"mouseenter",
    						function () {
    							if (is_function(debounce(/*showTooltip*/ ctx[4], /*delayShow*/ ctx[2]))) debounce(/*showTooltip*/ ctx[4], /*delayShow*/ ctx[2]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div0,
    						"mouseleave",
    						function () {
    							if (is_function(debounce(/*hideTooltip*/ ctx[5], /*delayHide*/ ctx[1]))) debounce(/*hideTooltip*/ ctx[5], /*delayHide*/ ctx[1]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(div0, "mouseenter", /*mouseenter_handler*/ ctx[10], false, false, false),
    					listen_dev(div0, "mouseleave", /*mouseleave_handler*/ ctx[11], false, false, false),
    					listen_dev(div0, "mouseover", /*mouseover_handler*/ ctx[12], false, false, false),
    					listen_dev(div0, "mouseout", /*mouseout_handler*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (activator_slot) {
    				if (activator_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(activator_slot, activator_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_activator_slot_changes, get_activator_slot_context);
    				}
    			}

    			if (/*show*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*show*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(activator_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(activator_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (activator_slot) activator_slot.d(detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const classesDefault = "tooltip whitespace-no-wrap text-xs absolute mt-2 bg-gray-600 text-gray-50 rounded md:px-2 md:py-2 py-4 px-3 z-30";

    function debounce(func, wait, immediate) {
    	let timeout;

    	return function () {
    		let context = this, args = arguments;

    		let later = function () {
    			timeout = null;
    			if (!immediate) func.apply(context, args);
    		};

    		let callNow = immediate && !timeout;
    		clearTimeout(timeout);
    		timeout = setTimeout(later, wait);
    		if (callNow) func.apply(context, args);
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let c;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tooltip", slots, ['activator','default']);
    	let { classes = classesDefault } = $$props;
    	let { show = false } = $$props;
    	let { timeout = null } = $$props;
    	let { delayHide = 100 } = $$props;
    	let { delayShow = 100 } = $$props;
    	const cb = new ClassBuilder(classes, classesDefault);

    	function showTooltip() {
    		if (show) return;
    		$$invalidate(0, show = true);
    		if (!timeout) return;

    		$$invalidate(6, timeout = setTimeout(
    			() => {
    				$$invalidate(0, show = false);
    			},
    			timeout
    		));
    	}

    	function hideTooltip() {
    		if (!show) return;
    		$$invalidate(0, show = false);
    		clearTimeout(timeout);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseout_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(15, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("classes" in $$new_props) $$invalidate(7, classes = $$new_props.classes);
    		if ("show" in $$new_props) $$invalidate(0, show = $$new_props.show);
    		if ("timeout" in $$new_props) $$invalidate(6, timeout = $$new_props.timeout);
    		if ("delayHide" in $$new_props) $$invalidate(1, delayHide = $$new_props.delayHide);
    		if ("delayShow" in $$new_props) $$invalidate(2, delayShow = $$new_props.delayShow);
    		if ("$$scope" in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		scale,
    		fade,
    		ClassBuilder,
    		classesDefault,
    		classes,
    		show,
    		timeout,
    		delayHide,
    		delayShow,
    		cb,
    		showTooltip,
    		hideTooltip,
    		debounce,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(15, $$props = assign(assign({}, $$props), $$new_props));
    		if ("classes" in $$props) $$invalidate(7, classes = $$new_props.classes);
    		if ("show" in $$props) $$invalidate(0, show = $$new_props.show);
    		if ("timeout" in $$props) $$invalidate(6, timeout = $$new_props.timeout);
    		if ("delayHide" in $$props) $$invalidate(1, delayHide = $$new_props.delayHide);
    		if ("delayShow" in $$props) $$invalidate(2, delayShow = $$new_props.delayShow);
    		if ("c" in $$props) $$invalidate(3, c = $$new_props.c);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(3, c = cb.flush().add(classes, true, classesDefault).add($$props.class).get());
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		show,
    		delayHide,
    		delayShow,
    		c,
    		showTooltip,
    		hideTooltip,
    		timeout,
    		classes,
    		$$scope,
    		slots,
    		mouseenter_handler,
    		mouseleave_handler,
    		mouseover_handler,
    		mouseout_handler
    	];
    }

    class Tooltip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			classes: 7,
    			show: 0,
    			timeout: 6,
    			delayHide: 1,
    			delayShow: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tooltip",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get classes() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get timeout() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set timeout(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get delayHide() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set delayHide(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get delayShow() {
    		throw new Error("<Tooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set delayShow(value) {
    		throw new Error("<Tooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\TFExample.svelte generated by Svelte v3.37.0 */

    // (62:0) <Button on:click={run}>
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("RUN");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(62:0) <Button on:click={run}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*run*/ ctx[0]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TFExample", slots, []);

    	let getData = async () => {
    		const carsDataResponse = await fetch("https://storage.googleapis.com/tfjs-tutorials/carsData.json");
    		const carsData = await carsDataResponse.json();

    		const cleaned = carsData.map(car => ({
    			mpg: car.Miles_per_Gallon,
    			horsepower: car.Horsepower
    		})).filter(car => car.mpg != null && car.horsepower != null);

    		return cleaned;
    	};

    	let run = async () => {
    		// Load and plot the original input data that we are going to train on.
    		const data = await getData();

    		const values = data.map(d => ({ x: d.horsepower, y: d.mpg }));

    		tfvis.render.scatterplot({ name: "Horsepower v MPG" }, { values }, {
    			xLabel: "Horsepower",
    			yLabel: "MPG",
    			height: 300
    		});

    		debugger;
    	}; // More code will be added below

    	let onError = e => {
    		showSnackbar = true;
    		message = e.detail.message;
    		snackbarColor = "error";
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TFExample> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Tooltip,
    		Slider,
    		Card,
    		Snackbar,
    		Button,
    		onMount,
    		getData,
    		run,
    		onError
    	});

    	$$self.$inject_state = $$props => {
    		if ("getData" in $$props) getData = $$props.getData;
    		if ("run" in $$props) $$invalidate(0, run = $$props.run);
    		if ("onError" in $$props) onError = $$props.onError;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [run];
    }

    class TFExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TFExample",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\FFNN.svelte generated by Svelte v3.37.0 */

    const file$1 = "src\\components\\FFNN.svelte";

    // (512:12) {:else}
    function create_else_block_1(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				block: true,
    				outlined: true,
    				disabled: /*running*/ ctx[2] || /*training*/ ctx[3],
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*train*/ ctx[0]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};
    			if (dirty[0] & /*running, training*/ 12) button_changes.disabled = /*running*/ ctx[2] || /*training*/ ctx[3];

    			if (dirty[2] & /*$$scope*/ 262144) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(512:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (510:12) {#if training}
    function create_if_block_1(ctx) {
    	let progresscircular;
    	let current;
    	progresscircular = new ProgressCircular({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(progresscircular.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(progresscircular, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresscircular.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresscircular.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(progresscircular, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(510:12) {#if training}",
    		ctx
    	});

    	return block;
    }

    // (513:16) <Button                      block                      outlined                      on:click={train}                      disabled={running || training}                  >
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("train");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(513:16) <Button                      block                      outlined                      on:click={train}                      disabled={running || training}                  >",
    		ctx
    	});

    	return block;
    }

    // (555:12) {:else}
    function create_else_block(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				block: true,
    				outlined: true,
    				disabled: /*running*/ ctx[2] || /*training*/ ctx[3] || !/*itemSelected*/ ctx[4],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*predict*/ ctx[1]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};
    			if (dirty[0] & /*running, training, itemSelected*/ 28) button_changes.disabled = /*running*/ ctx[2] || /*training*/ ctx[3] || !/*itemSelected*/ ctx[4];

    			if (dirty[2] & /*$$scope*/ 262144) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(555:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (553:12) {#if running}
    function create_if_block(ctx) {
    	let progresscircular;
    	let current;
    	progresscircular = new ProgressCircular({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(progresscircular.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(progresscircular, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresscircular.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresscircular.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(progresscircular, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(553:12) {#if running}",
    		ctx
    	});

    	return block;
    }

    // (556:16) <Button                      block                      outlined                      on:click={predict}                      disabled={running || training || !itemSelected}                  >
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("predict");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(556:16) <Button                      block                      outlined                      on:click={predict}                      disabled={running || training || !itemSelected}                  >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let h30;
    	let t1;
    	let div6;
    	let div1;
    	let h50;
    	let t3;
    	let h60;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let slider0;
    	let updating_value;
    	let t8;
    	let div0;
    	let t9;
    	let div3;
    	let h51;
    	let t11;
    	let div2;
    	let h61;
    	let t12;
    	let t13;
    	let t14;
    	let t15;
    	let slider1;
    	let updating_value_1;
    	let t16;
    	let h62;
    	let t17;
    	let t18;
    	let t19;
    	let t20;
    	let slider2;
    	let updating_value_2;
    	let t21;
    	let h63;
    	let t22;
    	let t23;
    	let t24;
    	let t25;
    	let slider3;
    	let updating_value_3;
    	let t26;
    	let select0;
    	let updating_value_4;
    	let t27;
    	let select1;
    	let updating_value_5;
    	let t28;
    	let h64;
    	let t29;
    	let t30;
    	let t31;
    	let t32;
    	let slider4;
    	let updating_value_6;
    	let t33;
    	let current_block_type_index;
    	let if_block0;
    	let t34;
    	let div5;
    	let h52;
    	let t36;
    	let div4;
    	let t37;
    	let br;
    	let t38;
    	let h31;
    	let t40;
    	let div10;
    	let div7;
    	let t41;
    	let div8;
    	let t42;
    	let div9;
    	let t43;
    	let h32;
    	let t45;
    	let div14;
    	let div13;
    	let div11;
    	let select2;
    	let t46;
    	let current_block_type_index_1;
    	let if_block1;
    	let t47;
    	let div12;
    	let current;

    	function slider0_value_binding(value) {
    		/*slider0_value_binding*/ ctx[39](value);
    	}

    	let slider0_props = {
    		min: "10",
    		step: "10",
    		max: "10000",
    		disabled: /*running*/ ctx[2] || /*training*/ ctx[3]
    	};

    	if (/*trainingDatasetSize*/ ctx[5] !== void 0) {
    		slider0_props.value = /*trainingDatasetSize*/ ctx[5];
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, "value", slider0_value_binding));
    	slider0.$on("change", /*change_handler*/ ctx[40]);

    	function slider1_value_binding(value) {
    		/*slider1_value_binding*/ ctx[42](value);
    	}

    	let slider1_props = {
    		min: "32",
    		step: "30",
    		max: "512",
    		disabled: /*running*/ ctx[2] || /*training*/ ctx[3]
    	};

    	if (/*batchSize*/ ctx[6] !== void 0) {
    		slider1_props.value = /*batchSize*/ ctx[6];
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, "value", slider1_value_binding));

    	function slider2_value_binding(value) {
    		/*slider2_value_binding*/ ctx[43](value);
    	}

    	let slider2_props = {
    		min: "10",
    		step: "10",
    		max: "200",
    		disabled: /*running*/ ctx[2] || /*training*/ ctx[3]
    	};

    	if (/*epochs*/ ctx[7] !== void 0) {
    		slider2_props.value = /*epochs*/ ctx[7];
    	}

    	slider2 = new Slider({ props: slider2_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider2, "value", slider2_value_binding));

    	function slider3_value_binding(value) {
    		/*slider3_value_binding*/ ctx[44](value);
    	}

    	let slider3_props = {
    		min: "1",
    		step: "1",
    		max: "1000",
    		disabled: /*running*/ ctx[2] || /*training*/ ctx[3]
    	};

    	if (/*hiddenLayerCount*/ ctx[8] !== void 0) {
    		slider3_props.value = /*hiddenLayerCount*/ ctx[8];
    	}

    	slider3 = new Slider({ props: slider3_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider3, "value", slider3_value_binding));

    	function select0_value_binding(value) {
    		/*select0_value_binding*/ ctx[45](value);
    	}

    	let select0_props = {
    		label: /*labelActivationFunction*/ ctx[24],
    		items: /*activationList*/ ctx[35]
    	};

    	if (/*activationFunction*/ ctx[9] !== void 0) {
    		select0_props.value = /*activationFunction*/ ctx[9];
    	}

    	select0 = new Select({ props: select0_props, $$inline: true });
    	binding_callbacks.push(() => bind(select0, "value", select0_value_binding));
    	select0.$on("change", /*change_handler_1*/ ctx[46]);

    	function select1_value_binding(value) {
    		/*select1_value_binding*/ ctx[47](value);
    	}

    	let select1_props = {
    		label: /*labelOptimizer*/ ctx[25],
    		items: /*optimizerList*/ ctx[36]
    	};

    	if (/*selectedOptimizer*/ ctx[10] !== void 0) {
    		select1_props.value = /*selectedOptimizer*/ ctx[10];
    	}

    	select1 = new Select({ props: select1_props, $$inline: true });
    	binding_callbacks.push(() => bind(select1, "value", select1_value_binding));
    	select1.$on("change", /*change_handler_2*/ ctx[48]);

    	function slider4_value_binding(value) {
    		/*slider4_value_binding*/ ctx[49](value);
    	}

    	let slider4_props = {
    		min: ".001",
    		step: ".001",
    		max: ".1",
    		disabled: /*running*/ ctx[2] || /*training*/ ctx[3]
    	};

    	if (/*learningRate*/ ctx[11] !== void 0) {
    		slider4_props.value = /*learningRate*/ ctx[11];
    	}

    	slider4 = new Slider({ props: slider4_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider4, "value", slider4_value_binding));
    	const if_block_creators = [create_if_block_1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*training*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	select2 = new Select({
    			props: {
    				label: /*labelDataset*/ ctx[30],
    				items: /*datasets*/ ctx[16]
    			},
    			$$inline: true
    		});

    	select2.$on("change", /*change_handler_3*/ ctx[54]);
    	const if_block_creators_1 = [create_if_block, create_else_block];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*running*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index_1 = select_block_type_1(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);

    	const block = {
    		c: function create() {
    			h30 = element("h3");
    			h30.textContent = `${/*labelTraining*/ ctx[22]}`;
    			t1 = space();
    			div6 = element("div");
    			div1 = element("div");
    			h50 = element("h5");
    			h50.textContent = `${/*labelTrainingDataset*/ ctx[33]}`;
    			t3 = space();
    			h60 = element("h6");
    			t4 = text(/*labelTrainingDatasetSize*/ ctx[34]);
    			t5 = text(": ");
    			t6 = text(/*trainingDatasetSize*/ ctx[5]);
    			t7 = space();
    			create_component(slider0.$$.fragment);
    			t8 = space();
    			div0 = element("div");
    			t9 = space();
    			div3 = element("div");
    			h51 = element("h5");
    			h51.textContent = `${/*labelTrainingSettings*/ ctx[32]}`;
    			t11 = space();
    			div2 = element("div");
    			h61 = element("h6");
    			t12 = text(/*labelBatchSize*/ ctx[27]);
    			t13 = text(": ");
    			t14 = text(/*batchSize*/ ctx[6]);
    			t15 = space();
    			create_component(slider1.$$.fragment);
    			t16 = space();
    			h62 = element("h6");
    			t17 = text(/*labelEpoch*/ ctx[28]);
    			t18 = text(": ");
    			t19 = text(/*epochs*/ ctx[7]);
    			t20 = space();
    			create_component(slider2.$$.fragment);
    			t21 = space();
    			h63 = element("h6");
    			t22 = text(/*labelHiddenLayer*/ ctx[29]);
    			t23 = text(": ");
    			t24 = text(/*hiddenLayerCount*/ ctx[8]);
    			t25 = space();
    			create_component(slider3.$$.fragment);
    			t26 = space();
    			create_component(select0.$$.fragment);
    			t27 = space();
    			create_component(select1.$$.fragment);
    			t28 = space();
    			h64 = element("h6");
    			t29 = text(/*labelLearningRate*/ ctx[26]);
    			t30 = text(": ");
    			t31 = text(/*learningRate*/ ctx[11]);
    			t32 = space();
    			create_component(slider4.$$.fragment);
    			t33 = space();
    			if_block0.c();
    			t34 = space();
    			div5 = element("div");
    			h52 = element("h5");
    			h52.textContent = `${/*labelTrainingResult*/ ctx[31]}`;
    			t36 = space();
    			div4 = element("div");
    			t37 = space();
    			br = element("br");
    			t38 = space();
    			h31 = element("h3");
    			h31.textContent = `${/*labelDatasets*/ ctx[21]}`;
    			t40 = space();
    			div10 = element("div");
    			div7 = element("div");
    			t41 = space();
    			div8 = element("div");
    			t42 = space();
    			div9 = element("div");
    			t43 = space();
    			h32 = element("h3");
    			h32.textContent = `${/*labelPrediction*/ ctx[23]}`;
    			t45 = space();
    			div14 = element("div");
    			div13 = element("div");
    			div11 = element("div");
    			create_component(select2.$$.fragment);
    			t46 = space();
    			if_block1.c();
    			t47 = space();
    			div12 = element("div");
    			add_location(h30, file$1, 413, 0, 12025);
    			attr_dev(h50, "class", "pb-4");
    			add_location(h50, file$1, 416, 8, 12090);
    			attr_dev(h60, "class", "pt-6 pb-4");
    			add_location(h60, file$1, 417, 8, 12144);
    			attr_dev(div0, "id", "trainingDataChart");
    			add_location(div0, file$1, 431, 8, 12621);
    			add_location(div1, file$1, 415, 4, 12075);
    			attr_dev(h51, "class", "pb-4");
    			add_location(h51, file$1, 435, 8, 12716);
    			attr_dev(h61, "class", "pt-6 pb-4");
    			add_location(h61, file$1, 437, 12, 12807);
    			attr_dev(h62, "class", "pt-6 pb-4");
    			add_location(h62, file$1, 446, 12, 13084);
    			attr_dev(h63, "class", "pt-6 pb-4");
    			add_location(h63, file$1, 455, 12, 13351);
    			attr_dev(h64, "class", "pt-6 pb-4");
    			add_location(h64, file$1, 500, 12, 14760);
    			attr_dev(div2, "class", "settings svelte-k82jeo");
    			add_location(div2, file$1, 436, 8, 12771);
    			add_location(div3, file$1, 434, 4, 12701);
    			attr_dev(h52, "class", "pb-4");
    			add_location(h52, file$1, 525, 8, 15437);
    			attr_dev(div4, "id", "train_chart");
    			add_location(div4, file$1, 526, 8, 15490);
    			add_location(div5, file$1, 524, 4, 15422);
    			attr_dev(div6, "class", "grid svelte-k82jeo");
    			add_location(div6, file$1, 414, 0, 12051);
    			add_location(br, file$1, 530, 0, 15561);
    			add_location(h31, file$1, 532, 0, 15571);
    			attr_dev(div7, "id", "datasetChart1");
    			add_location(div7, file$1, 534, 4, 15621);
    			attr_dev(div8, "id", "datasetChart2");
    			add_location(div8, file$1, 535, 4, 15679);
    			attr_dev(div9, "id", "datasetChart3");
    			add_location(div9, file$1, 536, 4, 15737);
    			attr_dev(div10, "class", "grid svelte-k82jeo");
    			add_location(div10, file$1, 533, 0, 15597);
    			add_location(h32, file$1, 539, 0, 15801);
    			attr_dev(div11, "class", "settings svelte-k82jeo");
    			add_location(div11, file$1, 542, 8, 15868);
    			attr_dev(div12, "id", "predict_chart");
    			add_location(div12, file$1, 566, 8, 16558);
    			add_location(div13, file$1, 541, 4, 15853);
    			attr_dev(div14, "class", "grid svelte-k82jeo");
    			add_location(div14, file$1, 540, 0, 15829);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h30, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div1);
    			append_dev(div1, h50);
    			append_dev(div1, t3);
    			append_dev(div1, h60);
    			append_dev(h60, t4);
    			append_dev(h60, t5);
    			append_dev(h60, t6);
    			append_dev(div1, t7);
    			mount_component(slider0, div1, null);
    			append_dev(div1, t8);
    			append_dev(div1, div0);
    			/*div0_binding*/ ctx[41](div0);
    			append_dev(div6, t9);
    			append_dev(div6, div3);
    			append_dev(div3, h51);
    			append_dev(div3, t11);
    			append_dev(div3, div2);
    			append_dev(div2, h61);
    			append_dev(h61, t12);
    			append_dev(h61, t13);
    			append_dev(h61, t14);
    			append_dev(div2, t15);
    			mount_component(slider1, div2, null);
    			append_dev(div2, t16);
    			append_dev(div2, h62);
    			append_dev(h62, t17);
    			append_dev(h62, t18);
    			append_dev(h62, t19);
    			append_dev(div2, t20);
    			mount_component(slider2, div2, null);
    			append_dev(div2, t21);
    			append_dev(div2, h63);
    			append_dev(h63, t22);
    			append_dev(h63, t23);
    			append_dev(h63, t24);
    			append_dev(div2, t25);
    			mount_component(slider3, div2, null);
    			append_dev(div2, t26);
    			mount_component(select0, div2, null);
    			append_dev(div2, t27);
    			mount_component(select1, div2, null);
    			append_dev(div2, t28);
    			append_dev(div2, h64);
    			append_dev(h64, t29);
    			append_dev(h64, t30);
    			append_dev(h64, t31);
    			append_dev(div2, t32);
    			mount_component(slider4, div2, null);
    			append_dev(div2, t33);
    			if_blocks[current_block_type_index].m(div2, null);
    			append_dev(div6, t34);
    			append_dev(div6, div5);
    			append_dev(div5, h52);
    			append_dev(div5, t36);
    			append_dev(div5, div4);
    			/*div4_binding*/ ctx[50](div4);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, h31, anchor);
    			insert_dev(target, t40, anchor);
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div7);
    			/*div7_binding*/ ctx[51](div7);
    			append_dev(div10, t41);
    			append_dev(div10, div8);
    			/*div8_binding*/ ctx[52](div8);
    			append_dev(div10, t42);
    			append_dev(div10, div9);
    			/*div9_binding*/ ctx[53](div9);
    			insert_dev(target, t43, anchor);
    			insert_dev(target, h32, anchor);
    			insert_dev(target, t45, anchor);
    			insert_dev(target, div14, anchor);
    			append_dev(div14, div13);
    			append_dev(div13, div11);
    			mount_component(select2, div11, null);
    			append_dev(div11, t46);
    			if_blocks_1[current_block_type_index_1].m(div11, null);
    			append_dev(div13, t47);
    			append_dev(div13, div12);
    			/*div12_binding*/ ctx[55](div12);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*trainingDatasetSize*/ 32) set_data_dev(t6, /*trainingDatasetSize*/ ctx[5]);
    			const slider0_changes = {};
    			if (dirty[0] & /*running, training*/ 12) slider0_changes.disabled = /*running*/ ctx[2] || /*training*/ ctx[3];

    			if (!updating_value && dirty[0] & /*trainingDatasetSize*/ 32) {
    				updating_value = true;
    				slider0_changes.value = /*trainingDatasetSize*/ ctx[5];
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			if (!current || dirty[0] & /*batchSize*/ 64) set_data_dev(t14, /*batchSize*/ ctx[6]);
    			const slider1_changes = {};
    			if (dirty[0] & /*running, training*/ 12) slider1_changes.disabled = /*running*/ ctx[2] || /*training*/ ctx[3];

    			if (!updating_value_1 && dirty[0] & /*batchSize*/ 64) {
    				updating_value_1 = true;
    				slider1_changes.value = /*batchSize*/ ctx[6];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    			if (!current || dirty[0] & /*epochs*/ 128) set_data_dev(t19, /*epochs*/ ctx[7]);
    			const slider2_changes = {};
    			if (dirty[0] & /*running, training*/ 12) slider2_changes.disabled = /*running*/ ctx[2] || /*training*/ ctx[3];

    			if (!updating_value_2 && dirty[0] & /*epochs*/ 128) {
    				updating_value_2 = true;
    				slider2_changes.value = /*epochs*/ ctx[7];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			slider2.$set(slider2_changes);
    			if (!current || dirty[0] & /*hiddenLayerCount*/ 256) set_data_dev(t24, /*hiddenLayerCount*/ ctx[8]);
    			const slider3_changes = {};
    			if (dirty[0] & /*running, training*/ 12) slider3_changes.disabled = /*running*/ ctx[2] || /*training*/ ctx[3];

    			if (!updating_value_3 && dirty[0] & /*hiddenLayerCount*/ 256) {
    				updating_value_3 = true;
    				slider3_changes.value = /*hiddenLayerCount*/ ctx[8];
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			slider3.$set(slider3_changes);
    			const select0_changes = {};

    			if (!updating_value_4 && dirty[0] & /*activationFunction*/ 512) {
    				updating_value_4 = true;
    				select0_changes.value = /*activationFunction*/ ctx[9];
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			select0.$set(select0_changes);
    			const select1_changes = {};

    			if (!updating_value_5 && dirty[0] & /*selectedOptimizer*/ 1024) {
    				updating_value_5 = true;
    				select1_changes.value = /*selectedOptimizer*/ ctx[10];
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			select1.$set(select1_changes);
    			if (!current || dirty[0] & /*learningRate*/ 2048) set_data_dev(t31, /*learningRate*/ ctx[11]);
    			const slider4_changes = {};
    			if (dirty[0] & /*running, training*/ 12) slider4_changes.disabled = /*running*/ ctx[2] || /*training*/ ctx[3];

    			if (!updating_value_6 && dirty[0] & /*learningRate*/ 2048) {
    				updating_value_6 = true;
    				slider4_changes.value = /*learningRate*/ ctx[11];
    				add_flush_callback(() => updating_value_6 = false);
    			}

    			slider4.$set(slider4_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div2, null);
    			}

    			const select2_changes = {};
    			if (dirty[0] & /*datasets*/ 65536) select2_changes.items = /*datasets*/ ctx[16];
    			select2.$set(select2_changes);
    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 === previous_block_index_1) {
    				if_blocks_1[current_block_type_index_1].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    					if_blocks_1[previous_block_index_1] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks_1[current_block_type_index_1];

    				if (!if_block1) {
    					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div11, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider0.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			transition_in(slider2.$$.fragment, local);
    			transition_in(slider3.$$.fragment, local);
    			transition_in(select0.$$.fragment, local);
    			transition_in(select1.$$.fragment, local);
    			transition_in(slider4.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(select2.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider0.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
    			transition_out(slider2.$$.fragment, local);
    			transition_out(slider3.$$.fragment, local);
    			transition_out(select0.$$.fragment, local);
    			transition_out(select1.$$.fragment, local);
    			transition_out(slider4.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(select2.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div6);
    			destroy_component(slider0);
    			/*div0_binding*/ ctx[41](null);
    			destroy_component(slider1);
    			destroy_component(slider2);
    			destroy_component(slider3);
    			destroy_component(select0);
    			destroy_component(select1);
    			destroy_component(slider4);
    			if_blocks[current_block_type_index].d();
    			/*div4_binding*/ ctx[50](null);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t40);
    			if (detaching) detach_dev(div10);
    			/*div7_binding*/ ctx[51](null);
    			/*div8_binding*/ ctx[52](null);
    			/*div9_binding*/ ctx[53](null);
    			if (detaching) detach_dev(t43);
    			if (detaching) detach_dev(h32);
    			if (detaching) detach_dev(t45);
    			if (detaching) detach_dev(div14);
    			destroy_component(select2);
    			if_blocks_1[current_block_type_index_1].d();
    			/*div12_binding*/ ctx[55](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FFNN", slots, []);
    	const dispatch = createEventDispatcher();

    	// Texts & Labels
    	let labelDatasets = "Datasets";

    	let labelFFNN = "Training & Prediction";
    	let labelSettinngs = "Settings";
    	let labelTraining = "Training";
    	let labelPrediction = "Prediction";
    	let labelActivationFunction = "activation";
    	let labelOptimizer = "optimizer";
    	let labelLearningRate = "learning rate";
    	let labelBatchSize = "batch size";
    	let labelEpoch = "epoch";
    	let labelHiddenLayer = "hidden layer";
    	let labelDataset = "dataset";
    	let labelMinWeight = "min weight";
    	let labelMaxWeight = "max weight";

    	// events
    	let running = false;

    	let itemSelected = false;
    	let training = false;

    	// Props training
    	// Labels
    	let labelTrainingResult = "result";

    	let labelTrainingSettings = "settings";
    	let labelTrainingDataset = "training dataset";
    	let labelTrainingDatasetSize = "training dataset size";
    	let trainingDatasetSize = 100;
    	let batchSize = 32; // Neuronen min 32 max 512
    	let epochs = 10; // Trainings Epochen 50 iterations
    	let hiddenLayerCount = 1; // Anzahl der hidden Layer
    	let minWeight = 0;
    	let maxWeight = 1;
    	let activationFunction = "none";
    	let selectedOptimizer = "adam"; // Optimizer
    	let learningRate = 0.001; // Lernrate

    	const activationList = [
    		"none",
    		"elu",
    		"hardSigmoid",
    		"linear",
    		"relu",
    		"relu6",
    		"selu",
    		"sigmoid",
    		"softmax",
    		"softplus",
    		"softsign",
    		"tanh",
    		"swish",
    		"mish"
    	];

    	const optimizerList = ["sgd", "momentum", "adagrad", "adadelta", "adam", "adamax", "rmsprop"];

    	// Charts
    	let trainingDataChart, trainChart;

    	// Data
    	let trainingData;

    	// Model
    	let modelName = "FFNNModel";

    	let trainedModel;

    	// Props prediction
    	// Data
    	let dataset1, dataset2, dataset3, selectedDataset;

    	let datasets = [];

    	// Charts
    	let datasetChart1, datasetChart2, datasetChart3, predictChart;

    	// lifecycle functions
    	onMount(async () => {
    		$$invalidate(14, trainingData = getTrainingData(trainingDatasetSize));
    		showData(trainingDataChart, trainingData);
    		dataset1 = getRandomData1(0.1, 0.3);
    		dataset2 = getRandomData2(0.4, 0.6);
    		dataset3 = getRandomData3(0.7, 1);
    		showData(datasetChart1, dataset1);
    		showData(datasetChart2, dataset2);
    		showData(datasetChart3, dataset3);

    		$$invalidate(16, datasets = [
    			{
    				value: 0,
    				text: "Training Dataset",
    				data: trainingData
    			},
    			{
    				value: 1,
    				text: "Dataset 1",
    				data: dataset1
    			},
    			{
    				value: 2,
    				text: "Dataset 2",
    				data: dataset2
    			},
    			{
    				value: 3,
    				text: "Dataset 3",
    				data: dataset3
    			}
    		]);
    	});

    	// functions
    	// Model
    	let createModel = () => {
    		// Create a sequential model
    		let model = tf.sequential();

    		// Add a single input layer
    		let inputConfig = {
    			inputShape: [1],
    			units: hiddenLayerCount,
    			useBias: true
    		};

    		if (activationFunction != "none") inputConfig.activation = activationFunction;
    		model.add(tf.layers.dense(inputConfig));

    		// // Add hidden layers
    		// let hiddenConfig = {
    		//     units: hiddenLayerCount,
    		//     useBias: true,
    		// };
    		// model.add(tf.layers.dense(hiddenConfig));
    		// model.add(tf.layers.dense(hiddenConfig));
    		// model.add(tf.layers.dense(hiddenConfig));
    		// model.add(tf.layers.dense(hiddenConfig));
    		// Add an output layer
    		let outputConfig = { units: 1, useBias: false };

    		model.add(tf.layers.dense(outputConfig));
    		return model;
    	};

    	let saveModel = async (model, name) => {
    		return await model.save(`localstorage://${name}`);
    	};

    	let loadModel = async name => {
    		return await tf.loadLayersModel(`localstorage://${name}`);
    	};

    	let getOptimizer = (name, learningRate) => {
    		let optimizer;

    		switch (name) {
    			case "sgd":
    				optimizer = tf.train.sgd(learningRate);
    				break;
    			case "momentum":
    				optimizer = tf.train.momentum(learningRate);
    				break;
    			case "adagrad":
    				optimizer = tf.train.adagrad(learningRate);
    				break;
    			case "adadelta":
    				optimizer = tf.train.adadelta(learningRate);
    				break;
    			case "adam":
    				optimizer = tf.train.adam(learningRate);
    				break;
    			case "adamax":
    				optimizer = tf.train.adamax(learningRate);
    				break;
    			case "rmsprop":
    				optimizer = tf.train.rmsprop(learningRate);
    				break;
    			default:
    				optimizer = tf.train.adam(learningRate);
    				break;
    		}

    		return optimizer;
    	};

    	// Data
    	let getTrainingData = (nCount = 100) => {
    		let dataArray = [];
    		for (let i = 0; i < nCount; i++) dataArray.push({ x: i, y: calcY(i) });
    		return dataArray;
    	};

    	let calcY = x => {
    		const y = (x + 0.8) * (x - 0.2) * (x - 0.3) * (x - 0.6);
    		return y;
    	};

    	let calcYs = x => {
    		// const ys = (x + 0.8) * (x - 0.2) * (x - 0.3) * (x - 0.6);
    		let xs = tf.tensor1d([x]);

    		let x1 = xs.add(0.8), x2 = xs.sub(0.2), x3 = xs.sub(0.3), x4 = xs.sub(0.6);
    		const ys = x1.mul(x2.mul(x3).mul(x4));
    		return ys.dataSync();
    	};

    	let getRandomData1 = (nMin, nMax) => {
    		let dataArray = [];

    		for (let i = 0; i < 1; i += 0.01) {
    			let x = i; // Math.random() * (nMax - nMin) + nMin;
    			let y = i + Math.random() * (nMax - nMin) + nMin;
    			dataArray.push({ x, y });
    		}

    		return dataArray;
    	};

    	let getRandomData2 = (nMin, nMax) => {
    		let dataArray = [];

    		for (let i = 0; i < 1; i += 0.01) {
    			let x = i; // Math.random() * (nMax - nMin) + nMin;
    			let y = x * x * x - 0.1 * x;
    			dataArray.push({ x, y });
    		}

    		return dataArray;
    	};

    	let getRandomData3 = (nMin, nMax) => {
    		let dataArray = [];

    		for (let i = 0; i < 1; i += 0.01) {
    			let x = i; // Math.random() * (nMax - nMin) + nMin;
    			let y = x * x * x * -0.9 + 1 * x;
    			dataArray.push({ x, y });
    		}

    		return dataArray;
    	};

    	let prepareData = data => {
    		return tf.tidy(() => {
    			// Step 1. Shuffle the data
    			tf.util.shuffle(data);

    			// Step 2. Convert data to Tensor
    			const inputs = data.map(d => d.x);

    			const labels = data.map(d => calcYs(d.x));
    			const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
    			const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    			//Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    			const inputMax = inputTensor.max();

    			const inputMin = inputTensor.min();
    			const labelMax = labelTensor.max();
    			const labelMin = labelTensor.min();
    			const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    			const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

    			return {
    				inputs: normalizedInputs,
    				labels: normalizedLabels,
    				// Return the min/max bounds so we can use them later.
    				inputMax,
    				inputMin,
    				labelMax,
    				labelMin
    			};
    		});
    	};

    	let showData = (htmlElement, values) => {
    		tfvis.render.scatterplot(htmlElement, { values }, {
    			xLabel: "X",
    			yLabel: "Y",
    			height: 200,
    			width: 400
    		});
    	};

    	async function train() {
    		$$invalidate(3, training = true);

    		// Create the model
    		let model = createModel();

    		// Convert the data to a form we can use for training.
    		const tensorData = prepareData(trainingData);

    		const { inputs, labels } = tensorData;

    		// Train the model
    		await trainModel(model, inputs, labels);

    		saveModel(model, modelName);
    		trainedModel = model;
    		$$invalidate(3, training = false);
    	}

    	let trainModel = async (model, inputs, labels) => {
    		const optimizer = getOptimizer(selectedOptimizer, learningRate);

    		// Prepare the model for training.
    		model.compile({
    			optimizer,
    			loss: tf.losses.meanSquaredError,
    			metrics: ["mse"]
    		});

    		return await model.fit(inputs, labels, {
    			batchSize,
    			epochs,
    			shuffle: true,
    			callbacks: tfvis.show.fitCallbacks(trainChart, ["loss", "mse"], {
    				height: 200,
    				width: 400,
    				callbacks: ["onEpochEnd"]
    			})
    		});
    	};

    	async function predict() {
    		$$invalidate(2, running = true);

    		// Create the model
    		let model = trainedModel ? trainedModel : await loadModel(modelName);

    		model.summary();

    		// Get Data
    		let data = selectedDataset.data;

    		// Convert the data to a form we can use for training.
    		const tensorData = prepareData(data);

    		// Make some predictions using the model and compare them to the
    		// original data
    		testModel(model, data, tensorData);

    		$$invalidate(2, running = false);
    	}

    	let testModel = (model, inputData, normalizationData) => {
    		const { inputs, labels, inputMax, inputMin, labelMin, labelMax } = normalizationData;

    		const [x, y] = tf.tidy(() => {
    			const x = inputs;
    			const y = model.predict(x.reshape([x.size, 1]));
    			const unNormXs = x.mul(inputMax.sub(inputMin)).add(inputMin);
    			const unNormPreds = y.mul(labelMax.sub(labelMin)).add(labelMin);

    			// Un-normalize the data
    			return [unNormXs.dataSync(), unNormPreds.dataSync()];
    		});

    		const predictedPoints = Array.from(x).map((val, i) => {
    			return { x: val, y: y[i] };
    		});

    		const originalPoints = inputData.map(d => ({ x: d.x, y: d.y }));

    		tfvis.render.scatterplot(
    			predictChart,
    			{
    				values: [originalPoints, predictedPoints],
    				series: ["original", "predicted"]
    			},
    			{
    				xLabel: "X",
    				yLabel: "Y",
    				height: 400,
    				width: 600
    			}
    		);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FFNN> was created with unknown prop '${key}'`);
    	});

    	function slider0_value_binding(value) {
    		trainingDatasetSize = value;
    		$$invalidate(5, trainingDatasetSize);
    	}

    	const change_handler = () => {
    		$$invalidate(14, trainingData = getTrainingData(trainingDatasetSize));
    		showData(trainingDataChart, trainingData);
    	};

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			trainingDataChart = $$value;
    			$$invalidate(12, trainingDataChart);
    		});
    	}

    	function slider1_value_binding(value) {
    		batchSize = value;
    		$$invalidate(6, batchSize);
    	}

    	function slider2_value_binding(value) {
    		epochs = value;
    		$$invalidate(7, epochs);
    	}

    	function slider3_value_binding(value) {
    		hiddenLayerCount = value;
    		$$invalidate(8, hiddenLayerCount);
    	}

    	function select0_value_binding(value) {
    		activationFunction = value;
    		$$invalidate(9, activationFunction);
    	}

    	const change_handler_1 = v => {
    		$$invalidate(9, activationFunction = v.detail);
    	};

    	function select1_value_binding(value) {
    		selectedOptimizer = value;
    		$$invalidate(10, selectedOptimizer);
    	}

    	const change_handler_2 = v => {
    		$$invalidate(10, selectedOptimizer = v.detail);
    	};

    	function slider4_value_binding(value) {
    		learningRate = value;
    		$$invalidate(11, learningRate);
    	}

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			trainChart = $$value;
    			$$invalidate(13, trainChart);
    		});
    	}

    	function div7_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			datasetChart1 = $$value;
    			$$invalidate(17, datasetChart1);
    		});
    	}

    	function div8_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			datasetChart2 = $$value;
    			$$invalidate(18, datasetChart2);
    		});
    	}

    	function div9_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			datasetChart3 = $$value;
    			$$invalidate(19, datasetChart3);
    		});
    	}

    	const change_handler_3 = v => {
    		$$invalidate(4, itemSelected = true);
    		$$invalidate(15, selectedDataset = datasets[v.detail]);
    	};

    	function div12_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			predictChart = $$value;
    			$$invalidate(20, predictChart);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		dispatch,
    		Tooltip,
    		Slider,
    		Card,
    		Snackbar,
    		Button,
    		ProgressCircular,
    		TextField,
    		Select,
    		Checkbox,
    		labelDatasets,
    		labelFFNN,
    		labelSettinngs,
    		labelTraining,
    		labelPrediction,
    		labelActivationFunction,
    		labelOptimizer,
    		labelLearningRate,
    		labelBatchSize,
    		labelEpoch,
    		labelHiddenLayer,
    		labelDataset,
    		labelMinWeight,
    		labelMaxWeight,
    		running,
    		itemSelected,
    		training,
    		labelTrainingResult,
    		labelTrainingSettings,
    		labelTrainingDataset,
    		labelTrainingDatasetSize,
    		trainingDatasetSize,
    		batchSize,
    		epochs,
    		hiddenLayerCount,
    		minWeight,
    		maxWeight,
    		activationFunction,
    		selectedOptimizer,
    		learningRate,
    		activationList,
    		optimizerList,
    		trainingDataChart,
    		trainChart,
    		trainingData,
    		modelName,
    		trainedModel,
    		dataset1,
    		dataset2,
    		dataset3,
    		selectedDataset,
    		datasets,
    		datasetChart1,
    		datasetChart2,
    		datasetChart3,
    		predictChart,
    		createModel,
    		saveModel,
    		loadModel,
    		getOptimizer,
    		getTrainingData,
    		calcY,
    		calcYs,
    		getRandomData1,
    		getRandomData2,
    		getRandomData3,
    		prepareData,
    		showData,
    		train,
    		trainModel,
    		predict,
    		testModel
    	});

    	$$self.$inject_state = $$props => {
    		if ("labelDatasets" in $$props) $$invalidate(21, labelDatasets = $$props.labelDatasets);
    		if ("labelFFNN" in $$props) labelFFNN = $$props.labelFFNN;
    		if ("labelSettinngs" in $$props) labelSettinngs = $$props.labelSettinngs;
    		if ("labelTraining" in $$props) $$invalidate(22, labelTraining = $$props.labelTraining);
    		if ("labelPrediction" in $$props) $$invalidate(23, labelPrediction = $$props.labelPrediction);
    		if ("labelActivationFunction" in $$props) $$invalidate(24, labelActivationFunction = $$props.labelActivationFunction);
    		if ("labelOptimizer" in $$props) $$invalidate(25, labelOptimizer = $$props.labelOptimizer);
    		if ("labelLearningRate" in $$props) $$invalidate(26, labelLearningRate = $$props.labelLearningRate);
    		if ("labelBatchSize" in $$props) $$invalidate(27, labelBatchSize = $$props.labelBatchSize);
    		if ("labelEpoch" in $$props) $$invalidate(28, labelEpoch = $$props.labelEpoch);
    		if ("labelHiddenLayer" in $$props) $$invalidate(29, labelHiddenLayer = $$props.labelHiddenLayer);
    		if ("labelDataset" in $$props) $$invalidate(30, labelDataset = $$props.labelDataset);
    		if ("labelMinWeight" in $$props) labelMinWeight = $$props.labelMinWeight;
    		if ("labelMaxWeight" in $$props) labelMaxWeight = $$props.labelMaxWeight;
    		if ("running" in $$props) $$invalidate(2, running = $$props.running);
    		if ("itemSelected" in $$props) $$invalidate(4, itemSelected = $$props.itemSelected);
    		if ("training" in $$props) $$invalidate(3, training = $$props.training);
    		if ("labelTrainingResult" in $$props) $$invalidate(31, labelTrainingResult = $$props.labelTrainingResult);
    		if ("labelTrainingSettings" in $$props) $$invalidate(32, labelTrainingSettings = $$props.labelTrainingSettings);
    		if ("labelTrainingDataset" in $$props) $$invalidate(33, labelTrainingDataset = $$props.labelTrainingDataset);
    		if ("labelTrainingDatasetSize" in $$props) $$invalidate(34, labelTrainingDatasetSize = $$props.labelTrainingDatasetSize);
    		if ("trainingDatasetSize" in $$props) $$invalidate(5, trainingDatasetSize = $$props.trainingDatasetSize);
    		if ("batchSize" in $$props) $$invalidate(6, batchSize = $$props.batchSize);
    		if ("epochs" in $$props) $$invalidate(7, epochs = $$props.epochs);
    		if ("hiddenLayerCount" in $$props) $$invalidate(8, hiddenLayerCount = $$props.hiddenLayerCount);
    		if ("minWeight" in $$props) minWeight = $$props.minWeight;
    		if ("maxWeight" in $$props) maxWeight = $$props.maxWeight;
    		if ("activationFunction" in $$props) $$invalidate(9, activationFunction = $$props.activationFunction);
    		if ("selectedOptimizer" in $$props) $$invalidate(10, selectedOptimizer = $$props.selectedOptimizer);
    		if ("learningRate" in $$props) $$invalidate(11, learningRate = $$props.learningRate);
    		if ("trainingDataChart" in $$props) $$invalidate(12, trainingDataChart = $$props.trainingDataChart);
    		if ("trainChart" in $$props) $$invalidate(13, trainChart = $$props.trainChart);
    		if ("trainingData" in $$props) $$invalidate(14, trainingData = $$props.trainingData);
    		if ("modelName" in $$props) modelName = $$props.modelName;
    		if ("trainedModel" in $$props) trainedModel = $$props.trainedModel;
    		if ("dataset1" in $$props) dataset1 = $$props.dataset1;
    		if ("dataset2" in $$props) dataset2 = $$props.dataset2;
    		if ("dataset3" in $$props) dataset3 = $$props.dataset3;
    		if ("selectedDataset" in $$props) $$invalidate(15, selectedDataset = $$props.selectedDataset);
    		if ("datasets" in $$props) $$invalidate(16, datasets = $$props.datasets);
    		if ("datasetChart1" in $$props) $$invalidate(17, datasetChart1 = $$props.datasetChart1);
    		if ("datasetChart2" in $$props) $$invalidate(18, datasetChart2 = $$props.datasetChart2);
    		if ("datasetChart3" in $$props) $$invalidate(19, datasetChart3 = $$props.datasetChart3);
    		if ("predictChart" in $$props) $$invalidate(20, predictChart = $$props.predictChart);
    		if ("createModel" in $$props) createModel = $$props.createModel;
    		if ("saveModel" in $$props) saveModel = $$props.saveModel;
    		if ("loadModel" in $$props) loadModel = $$props.loadModel;
    		if ("getOptimizer" in $$props) getOptimizer = $$props.getOptimizer;
    		if ("getTrainingData" in $$props) $$invalidate(37, getTrainingData = $$props.getTrainingData);
    		if ("calcY" in $$props) calcY = $$props.calcY;
    		if ("calcYs" in $$props) calcYs = $$props.calcYs;
    		if ("getRandomData1" in $$props) getRandomData1 = $$props.getRandomData1;
    		if ("getRandomData2" in $$props) getRandomData2 = $$props.getRandomData2;
    		if ("getRandomData3" in $$props) getRandomData3 = $$props.getRandomData3;
    		if ("prepareData" in $$props) prepareData = $$props.prepareData;
    		if ("showData" in $$props) $$invalidate(38, showData = $$props.showData);
    		if ("trainModel" in $$props) trainModel = $$props.trainModel;
    		if ("testModel" in $$props) testModel = $$props.testModel;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*training*/ 8) {
    			(dispatch("training", training));
    		}

    		if ($$self.$$.dirty[0] & /*running*/ 4) {
    			(dispatch("running", running));
    		}
    	};

    	return [
    		train,
    		predict,
    		running,
    		training,
    		itemSelected,
    		trainingDatasetSize,
    		batchSize,
    		epochs,
    		hiddenLayerCount,
    		activationFunction,
    		selectedOptimizer,
    		learningRate,
    		trainingDataChart,
    		trainChart,
    		trainingData,
    		selectedDataset,
    		datasets,
    		datasetChart1,
    		datasetChart2,
    		datasetChart3,
    		predictChart,
    		labelDatasets,
    		labelTraining,
    		labelPrediction,
    		labelActivationFunction,
    		labelOptimizer,
    		labelLearningRate,
    		labelBatchSize,
    		labelEpoch,
    		labelHiddenLayer,
    		labelDataset,
    		labelTrainingResult,
    		labelTrainingSettings,
    		labelTrainingDataset,
    		labelTrainingDatasetSize,
    		activationList,
    		optimizerList,
    		getTrainingData,
    		showData,
    		slider0_value_binding,
    		change_handler,
    		div0_binding,
    		slider1_value_binding,
    		slider2_value_binding,
    		slider3_value_binding,
    		select0_value_binding,
    		change_handler_1,
    		select1_value_binding,
    		change_handler_2,
    		slider4_value_binding,
    		div4_binding,
    		div7_binding,
    		div8_binding,
    		div9_binding,
    		change_handler_3,
    		div12_binding
    	];
    }

    class FFNN extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { train: 0, predict: 1 }, [-1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FFNN",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get train() {
    		return this.$$.ctx[0];
    	}

    	set train(value) {
    		throw new Error("<FFNN>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get predict() {
    		return this.$$.ctx[1];
    	}

    	set predict(value) {
    		throw new Error("<FFNN>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\TFModel.svelte generated by Svelte v3.37.0 */

    const { console: console_1 } = globals;

    function create_fragment$1(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function show() {
    	if (!tfvis.visor().isOpen()) tfvis.visor().toggle();
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TFModel", slots, []);
    	const dispatch = createEventDispatcher();
    	let { modelName } = $$props;
    	let { batchSize } = $$props; // min 32 max 512
    	let { epochs } = $$props; // 50 iterations
    	let { url } = $$props;
    	let { running } = $$props;
    	let { opened } = $$props;

    	// $: tfvis.visor().isOpen(), dispatch("opened", tfvis.visor().isOpen());
    	// Data
    	let getData = async () => {
    		const carsDataResponse = await fetch("https://storage.googleapis.com/tfjs-tutorials/carsData.json");
    		const carsData = await carsDataResponse.json();

    		const cleaned = carsData.map(car => ({
    			mpg: car.Miles_per_Gallon,
    			horsepower: car.Horsepower
    		})).filter(car => car.mpg != null && car.horsepower != null);

    		return cleaned;
    	};

    	// functions
    	let createModel = () => {
    		// Create a sequential model
    		const model = tf.sequential();

    		// Add a single input layer
    		model.add(tf.layers.dense({ inputShape: [1], units: 1, useBias: true }));

    		// Add an output layer
    		model.add(tf.layers.dense({ units: 1, useBias: true }));

    		return model;
    	};

    	let trainModel = async (model, inputs, labels) => {
    		// Prepare the model for training.
    		model.compile({
    			optimizer: tf.train.adam(),
    			loss: tf.losses.meanSquaredError,
    			metrics: ["mse"]
    		});

    		// return await model.fit(inputs, labels, {
    		//     batchSize,
    		//     epochs,
    		//     shuffle: true,
    		//     callbacks: dispatch("traning", {done: true, text: "Tarining Done"})
    		// });
    		return await model.fit(inputs, labels, {
    			batchSize,
    			epochs,
    			shuffle: true,
    			callbacks: tfvis.show.fitCallbacks({ name: "Training Performance" }, ["loss", "mse"], { height: 200, callbacks: ["onEpochEnd"] })
    		});
    	};

    	let convertToTensor = data => {
    		// Wrapping these calculations in a tidy will dispose any
    		// intermediate tensors.
    		return tf.tidy(() => {
    			// Step 1. Shuffle the data
    			tf.util.shuffle(data);

    			// Step 2. Convert data to Tensor
    			const inputs = data.map(d => d.horsepower);

    			const labels = data.map(d => d.mpg);
    			const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
    			const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    			//Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    			const inputMax = inputTensor.max();

    			const inputMin = inputTensor.min();
    			const labelMax = labelTensor.max();
    			const labelMin = labelTensor.min();
    			const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    			const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

    			return {
    				inputs: normalizedInputs,
    				labels: normalizedLabels,
    				// Return the min/max bounds so we can use them later.
    				inputMax,
    				inputMin,
    				labelMax,
    				labelMin
    			};
    		});
    	};

    	let testModel = (model, inputData, normalizationData) => {
    		const { inputMax, inputMin, labelMin, labelMax } = normalizationData;

    		// Generate predictions for a uniform range of numbers between 0 and 1;
    		// We un-normalize the data by doing the inverse of the min-max scaling
    		// that we did earlier.
    		const [xs, preds] = tf.tidy(() => {
    			const xs = tf.linspace(0, 1, 100);
    			const preds = model.predict(xs.reshape([100, 1]));
    			const unNormXs = xs.mul(inputMax.sub(inputMin)).add(inputMin);
    			const unNormPreds = preds.mul(labelMax.sub(labelMin)).add(labelMin);

    			// Un-normalize the data
    			return [unNormXs.dataSync(), unNormPreds.dataSync()];
    		});

    		const predictedPoints = Array.from(xs).map((val, i) => {
    			return { x: val, y: preds[i] };
    		});

    		const originalPoints = inputData.map(d => ({ x: d.horsepower, y: d.mpg }));

    		tfvis.render.scatterplot(
    			{
    				name: "Model Predictions vs Original Data"
    			},
    			{
    				values: [originalPoints, predictedPoints],
    				series: ["original", "predicted"]
    			},
    			{
    				xLabel: "Horsepower",
    				yLabel: "MPG",
    				height: 300
    			}
    		);
    	};

    	async function run() {
    		$$invalidate(0, running = true);

    		// Create the model
    		const model = createModel();

    		// tfvis.show.modelSummary({ name: modelName }, model);
    		// Get Data
    		const data = await getData(url);

    		// Convert the data to a form we can use for training.
    		const tensorData = convertToTensor(data);

    		const { inputs, labels } = tensorData;

    		// Train the model
    		await trainModel(model, inputs, labels);

    		$$invalidate(0, running = false);
    		console.log("Done Training");

    		// Make some predictions using the model and compare them to the
    		// original data
    		testModel(model, data, tensorData);
    	}

    	const writable_props = ["modelName", "batchSize", "epochs", "url", "running", "opened"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<TFModel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("modelName" in $$props) $$invalidate(1, modelName = $$props.modelName);
    		if ("batchSize" in $$props) $$invalidate(2, batchSize = $$props.batchSize);
    		if ("epochs" in $$props) $$invalidate(3, epochs = $$props.epochs);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("running" in $$props) $$invalidate(0, running = $$props.running);
    		if ("opened" in $$props) $$invalidate(5, opened = $$props.opened);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		dispatch,
    		modelName,
    		batchSize,
    		epochs,
    		url,
    		running,
    		opened,
    		getData,
    		createModel,
    		trainModel,
    		convertToTensor,
    		testModel,
    		run,
    		show
    	});

    	$$self.$inject_state = $$props => {
    		if ("modelName" in $$props) $$invalidate(1, modelName = $$props.modelName);
    		if ("batchSize" in $$props) $$invalidate(2, batchSize = $$props.batchSize);
    		if ("epochs" in $$props) $$invalidate(3, epochs = $$props.epochs);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("running" in $$props) $$invalidate(0, running = $$props.running);
    		if ("opened" in $$props) $$invalidate(5, opened = $$props.opened);
    		if ("getData" in $$props) getData = $$props.getData;
    		if ("createModel" in $$props) createModel = $$props.createModel;
    		if ("trainModel" in $$props) trainModel = $$props.trainModel;
    		if ("convertToTensor" in $$props) convertToTensor = $$props.convertToTensor;
    		if ("testModel" in $$props) testModel = $$props.testModel;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*running*/ 1) {
    			// events
    			(dispatch("running", running));
    		}
    	};

    	return [running, modelName, batchSize, epochs, url, opened, run, show];
    }

    class TFModel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			modelName: 1,
    			batchSize: 2,
    			epochs: 3,
    			url: 4,
    			running: 0,
    			opened: 5,
    			run: 6,
    			show: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TFModel",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*modelName*/ ctx[1] === undefined && !("modelName" in props)) {
    			console_1.warn("<TFModel> was created without expected prop 'modelName'");
    		}

    		if (/*batchSize*/ ctx[2] === undefined && !("batchSize" in props)) {
    			console_1.warn("<TFModel> was created without expected prop 'batchSize'");
    		}

    		if (/*epochs*/ ctx[3] === undefined && !("epochs" in props)) {
    			console_1.warn("<TFModel> was created without expected prop 'epochs'");
    		}

    		if (/*url*/ ctx[4] === undefined && !("url" in props)) {
    			console_1.warn("<TFModel> was created without expected prop 'url'");
    		}

    		if (/*running*/ ctx[0] === undefined && !("running" in props)) {
    			console_1.warn("<TFModel> was created without expected prop 'running'");
    		}

    		if (/*opened*/ ctx[5] === undefined && !("opened" in props)) {
    			console_1.warn("<TFModel> was created without expected prop 'opened'");
    		}
    	}

    	get modelName() {
    		throw new Error("<TFModel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modelName(value) {
    		throw new Error("<TFModel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get batchSize() {
    		throw new Error("<TFModel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set batchSize(value) {
    		throw new Error("<TFModel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get epochs() {
    		throw new Error("<TFModel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set epochs(value) {
    		throw new Error("<TFModel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<TFModel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<TFModel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get running() {
    		throw new Error("<TFModel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set running(value) {
    		throw new Error("<TFModel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opened() {
    		throw new Error("<TFModel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opened(value) {
    		throw new Error("<TFModel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get run() {
    		return this.$$.ctx[6];
    	}

    	set run(value) {
    		throw new Error("<TFModel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show() {
    		return show;
    	}

    	set show(value) {
    		throw new Error("<TFModel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.37.0 */
    const file = "src\\App.svelte";

    // (121:0) <Snackbar   bind:value={showSnackbar}   noAction   color={snackbarColor}   timeout={snackbarTimeout}  >
    function create_default_slot_1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*message*/ ctx[4]);
    			attr_dev(div, "class", "svelte-2u6epd");
    			add_location(div, file, 126, 1, 2621);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 16) set_data_dev(t, /*message*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(121:0) <Snackbar   bind:value={showSnackbar}   noAction   color={snackbarColor}   timeout={snackbarTimeout}  >",
    		ctx
    	});

    	return block;
    }

    // (129:2) <Button on:click={() => (showSnackbar = false)}>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Close");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(129:2) <Button on:click={() => (showSnackbar = false)}>",
    		ctx
    	});

    	return block;
    }

    // (128:1) 
    function create_action_slot(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[10]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "slot", "action");
    			attr_dev(div, "class", "svelte-2u6epd");
    			add_location(div, file, 127, 1, 2644);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_action_slot.name,
    		type: "slot",
    		source: "(128:1) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let header;
    	let h50;
    	let t2;
    	let h3;
    	let t4;
    	let main;
    	let div1;
    	let div0;
    	let ffnn;
    	let t5;
    	let snackbar;
    	let updating_value;
    	let t6;
    	let footer;
    	let div2;
    	let h51;
    	let t8;
    	let a0;
    	let p0;
    	let t10;
    	let a1;
    	let p1;
    	let t12;
    	let a2;
    	let p2;
    	let current;
    	ffnn = new FFNN({ $$inline: true });
    	ffnn.$on("running", /*running_handler*/ ctx[8]);
    	ffnn.$on("opened", /*opened_handler*/ ctx[9]);

    	function snackbar_value_binding(value) {
    		/*snackbar_value_binding*/ ctx[11](value);
    	}

    	let snackbar_props = {
    		noAction: true,
    		color: /*snackbarColor*/ ctx[3],
    		timeout: /*snackbarTimeout*/ ctx[5],
    		$$slots: {
    			action: [create_action_slot],
    			default: [create_default_slot_1]
    		},
    		$$scope: { ctx }
    	};

    	if (/*showSnackbar*/ ctx[0] !== void 0) {
    		snackbar_props.value = /*showSnackbar*/ ctx[0];
    	}

    	snackbar = new Snackbar({ props: snackbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(snackbar, "value", snackbar_value_binding));

    	const block = {
    		c: function create() {
    			header = element("header");
    			h50 = element("h5");
    			h50.textContent = `Einsendeaufgabe ${/*taskNumber*/ ctx[7]}`;
    			t2 = space();
    			h3 = element("h3");
    			h3.textContent = `${/*taskTitle*/ ctx[6]}`;
    			t4 = space();
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(ffnn.$$.fragment);
    			t5 = space();
    			create_component(snackbar.$$.fragment);
    			t6 = space();
    			footer = element("footer");
    			div2 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Ressourcen";
    			t8 = space();
    			a0 = element("a");
    			p0 = element("p");
    			p0.textContent = "Github Repository";
    			t10 = space();
    			a1 = element("a");
    			p1 = element("p");
    			p1.textContent = "Svelte";
    			t12 = space();
    			a2 = element("a");
    			p2 = element("p");
    			p2.textContent = "Smeltejs";
    			attr_dev(h50, "class", "svelte-2u6epd");
    			add_location(h50, file, 66, 1, 1260);
    			attr_dev(h3, "class", "svelte-2u6epd");
    			add_location(h3, file, 67, 1, 1300);
    			attr_dev(header, "class", "svelte-2u6epd");
    			add_location(header, file, 65, 0, 1249);
    			attr_dev(div0, "class", "card svelte-2u6epd");
    			add_location(div0, file, 72, 2, 1366);
    			attr_dev(div1, "class", "grid svelte-2u6epd");
    			add_location(div1, file, 71, 1, 1344);
    			attr_dev(main, "class", "svelte-2u6epd");
    			add_location(main, file, 70, 0, 1335);
    			attr_dev(h51, "class", "svelte-2u6epd");
    			add_location(h51, file, 134, 2, 2775);
    			attr_dev(p0, "class", "svelte-2u6epd");
    			add_location(p0, file, 136, 3, 2851);
    			attr_dev(a0, "href", "https://github.com/tonyflow90/dl_ea03");
    			attr_dev(a0, "class", "svelte-2u6epd");
    			add_location(a0, file, 135, 2, 2798);
    			attr_dev(p1, "class", "svelte-2u6epd");
    			add_location(p1, file, 139, 3, 2922);
    			attr_dev(a1, "href", "https://svelte.dev/");
    			attr_dev(a1, "class", "svelte-2u6epd");
    			add_location(a1, file, 138, 2, 2887);
    			attr_dev(p2, "class", "svelte-2u6epd");
    			add_location(p2, file, 142, 3, 2984);
    			attr_dev(a2, "href", "https://smeltejs.com/");
    			attr_dev(a2, "class", "svelte-2u6epd");
    			add_location(a2, file, 141, 2, 2947);
    			attr_dev(div2, "class", "svelte-2u6epd");
    			add_location(div2, file, 133, 1, 2766);
    			attr_dev(footer, "class", "svelte-2u6epd");
    			add_location(footer, file, 132, 0, 2755);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h50);
    			append_dev(header, t2);
    			append_dev(header, h3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			mount_component(ffnn, div0, null);
    			insert_dev(target, t5, anchor);
    			mount_component(snackbar, target, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div2);
    			append_dev(div2, h51);
    			append_dev(div2, t8);
    			append_dev(div2, a0);
    			append_dev(a0, p0);
    			append_dev(div2, t10);
    			append_dev(div2, a1);
    			append_dev(a1, p1);
    			append_dev(div2, t12);
    			append_dev(div2, a2);
    			append_dev(a2, p2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const snackbar_changes = {};
    			if (dirty & /*snackbarColor*/ 8) snackbar_changes.color = /*snackbarColor*/ ctx[3];

    			if (dirty & /*$$scope, showSnackbar, message*/ 4194321) {
    				snackbar_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*showSnackbar*/ 1) {
    				updating_value = true;
    				snackbar_changes.value = /*showSnackbar*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			snackbar.$set(snackbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ffnn.$$.fragment, local);
    			transition_in(snackbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ffnn.$$.fragment, local);
    			transition_out(snackbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(main);
    			destroy_component(ffnn);
    			if (detaching) detach_dev(t5);
    			destroy_component(snackbar, detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let showSnackbar = false;
    	let snackbarTimeout = 2000;
    	let model = undefined;
    	let modelName = "Car Model";
    	let batchSize = 32;
    	let epochs = 50;
    	let url = "https://storage.googleapis.com/tfjs-tutorials/carsData.json";
    	let running;
    	let opened;

    	// Data
    	// Texts & Labels
    	let taskTitle = "Regression mit FFNN";

    	let taskNumber = 3;

    	// Texts & Labels
    	let labelBatchSize = "batch size";

    	let labelEpoch = "epoch";
    	let snackbarColor = "success";
    	let message = "";

    	let onError = e => {
    		$$invalidate(0, showSnackbar = true);
    		$$invalidate(4, message = e.detail.message);
    		$$invalidate(3, snackbarColor = "error");
    	};

    	// functions
    	let runModel = () => {
    		model.run();
    	};

    	let showModel = async () => {
    		model.show();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const running_handler = e => $$invalidate(1, running = e.detail);
    	const opened_handler = e => $$invalidate(2, opened = e.detail);
    	const click_handler = () => $$invalidate(0, showSnackbar = false);

    	function snackbar_value_binding(value) {
    		showSnackbar = value;
    		$$invalidate(0, showSnackbar);
    	}

    	$$self.$capture_state = () => ({
    		TFExample,
    		Tooltip,
    		Slider,
    		Card,
    		Snackbar,
    		Button,
    		ProgressCircular,
    		onMount,
    		FFNN,
    		TfModel: TFModel,
    		showSnackbar,
    		snackbarTimeout,
    		model,
    		modelName,
    		batchSize,
    		epochs,
    		url,
    		running,
    		opened,
    		taskTitle,
    		taskNumber,
    		labelBatchSize,
    		labelEpoch,
    		snackbarColor,
    		message,
    		onError,
    		runModel,
    		showModel
    	});

    	$$self.$inject_state = $$props => {
    		if ("showSnackbar" in $$props) $$invalidate(0, showSnackbar = $$props.showSnackbar);
    		if ("snackbarTimeout" in $$props) $$invalidate(5, snackbarTimeout = $$props.snackbarTimeout);
    		if ("model" in $$props) model = $$props.model;
    		if ("modelName" in $$props) modelName = $$props.modelName;
    		if ("batchSize" in $$props) batchSize = $$props.batchSize;
    		if ("epochs" in $$props) epochs = $$props.epochs;
    		if ("url" in $$props) url = $$props.url;
    		if ("running" in $$props) $$invalidate(1, running = $$props.running);
    		if ("opened" in $$props) $$invalidate(2, opened = $$props.opened);
    		if ("taskTitle" in $$props) $$invalidate(6, taskTitle = $$props.taskTitle);
    		if ("taskNumber" in $$props) $$invalidate(7, taskNumber = $$props.taskNumber);
    		if ("labelBatchSize" in $$props) labelBatchSize = $$props.labelBatchSize;
    		if ("labelEpoch" in $$props) labelEpoch = $$props.labelEpoch;
    		if ("snackbarColor" in $$props) $$invalidate(3, snackbarColor = $$props.snackbarColor);
    		if ("message" in $$props) $$invalidate(4, message = $$props.message);
    		if ("onError" in $$props) onError = $$props.onError;
    		if ("runModel" in $$props) runModel = $$props.runModel;
    		if ("showModel" in $$props) showModel = $$props.showModel;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showSnackbar,
    		running,
    		opened,
    		snackbarColor,
    		message,
    		snackbarTimeout,
    		taskTitle,
    		taskNumber,
    		running_handler,
    		opened_handler,
    		click_handler,
    		snackbar_value_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
