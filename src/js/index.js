class Heatmap {
    constructor() {
        this.props = {
            elements: {
                body: document.body,
                filter: null
            },
            classes: {
                point: 'point',
                adding: 'adding',
                pointInfo: 'point_info',
                filter: 'filter',
                filterItem: 'filter_item',
                filterItemActive: 'filter_item__active',
                showAll: 'show_all',
                pointInfoHide: 'point__hide'
            },
            data: {
                sessionId: null,
                events: null,
                filterStorage: []
            },
        };

        this.init();
    }

    init() {
        this.networkData();
        this.events();
        this.createPointAfterError();
        this.createFilter();
    }

    networkData() {
        let {data} = this.props;

        if (sessionStorage.getItem('sessionId')) {
            data.sessionId = sessionStorage.getItem('sessionId');
        } else {
            sessionStorage.setItem('sessionId', Math.random().toString(36).substring(7));
            data.sessionId = sessionStorage.getItem('sessionId');
        }

        if (sessionStorage.getItem('sessionEvents')) {
            data.events = JSON.parse(sessionStorage.getItem('sessionEvents'));
        } else {
            data.events = [];
        }
    }

    pushData(e, device = 'mobile') {
        let {data} = this.props;

        if (device === 'mobile') {
            data.events.push({
                sessionId: data.sessionId,
                timeStamp: e.timeStamp,
                type: e.type,
                pageX: e.changedTouches[0].clientX,
                pageY: e.changedTouches[0].clientY,
                target: {
                    nodeName: e.target.nodeName
                }
            });
        } else {
            data.events.push({
                sessionId: data.sessionId,
                timeStamp: e.timeStamp,
                type: e.type,
                pageX: e.clientX,
                pageY: e.clientY,
                target: {
                    nodeName: e.target.nodeName
                }
            });
        }

        sessionStorage.setItem('sessionEvents', JSON.stringify(data.events));
    }

    createPointAfterError() {
        let {data} = this.props;

        if (data.events.length > 0) {
            data.events.forEach((e) => {
                this.createPoint(e, false, false);
            });
        }
    };

    events() {
        let {elements: {body}} = this.props, handler;

        body.addEventListener('mousedown', (e) => {
            this.createPoint(e, true, 'desktop');

            body.addEventListener('mousemove', handler = (e) => {
                this.createPoint(e, true, 'desktop');
            });
        });

        body.addEventListener('mouseup', (e) => {
            this.createPoint(e, true, 'desktop');

            body.removeEventListener('mousemove', handler);
        });

        body.addEventListener('touchstart', (e) => {
            this.createPoint(e, true, 'mobile');

            body.addEventListener('touchmove', handler = (e) => {
                this.createPoint(e, true, 'mobile');
            });
        });

        body.addEventListener('touchend', (e) => {
            this.createPoint(e, true, 'mobile');

            body.removeEventListener('touchmove', handler);
        });
    }

    createPoint(e, isPushData = true, device = 'mobile') {
        let {elements: {body}, classes} = this.props;

        let point = document.createElement('span');
        point.classList.add(classes.point, classes.adding, e.type);
        point.dataset.filter = e.type;
        if (device === 'mobile') {
            point.style.left = `${e.changedTouches[0].pageX - 15}px`;
            point.style.top = `${e.changedTouches[0].pageY - 15}px`;
        } else {
            point.style.left = `${e.pageX - 15}px`;
            point.style.top = `${e.pageY - 15}px`;
        }
        body.append(point);

        if (isPushData === true) {
            this.pushData(e, device);
        }
        this.createPointInfo(point, e, device);

        setTimeout(function () {
            point.classList.remove(classes.adding);
        }, 100);

        this.createFilter();
    }

    createPointInfo(point, e, device = 'mobile') {
        let {classes, data} = this.props;

        let pointInfo = document.createElement('span');
        pointInfo.classList.add(classes.pointInfo);
        if (device === 'mobile') {
            pointInfo.innerHTML = `
        <span>sessionId: ${data.sessionId}</span>
        <span>timestamp: ${e.timeStamp}</span>
        <span>type: ${e.type}</span>
        <span>coordinates<br>x: ${e.changedTouches[0].pageX}, y: ${e.changedTouches[0].pageY}</span>
        <span>screen: ${e.target.nodeName}</span>
        `;
        } else {
            pointInfo.innerHTML = `
        <span>sessionId: ${data.sessionId}</span>
        <span>timestamp: ${e.timeStamp}</span>
        <span>type: ${e.type}</span>
        <span>coordinates<br>x: ${e.pageX}, y: ${e.pageY}</span>
        <span>screen: ${e.target.nodeName}</span>
        `;
        }

        point.append(pointInfo);
    }

    createFilter() {
        let {elements, elements: {body}, classes, data: {events, filterStorage}} = this.props, filterItem;

        if (events.length === 0)
            return;

        events.forEach((event) => {
            if (filterStorage.length === 0) {
                filterStorage.push(event.type);

                elements.filter = document.createElement('span');
                elements.filter.classList.add(classes.filter);
                body.append(elements.filter);
                this.stopPropagationAllEvents(elements.filter);

                filterItem = document.createElement('span');
                filterItem.classList.add(classes.filterItem, classes.filterItemActive);
                filterItem.dataset.filter = classes.showAll;
                filterItem.textContent = classes.showAll;
                elements.filter.append(filterItem);

                filterItem.addEventListener('click', (e) => {
                    this.filter(e);
                });

                filterItem = document.createElement('span');
                filterItem.classList.add(classes.filterItem);
                filterItem.dataset.filter = event.type;
                filterItem.textContent = event.type;
                elements.filter.append(filterItem);

                filterItem.addEventListener('click', (e) => {
                    this.filter(e);
                });
            } else {
                if (filterStorage.indexOf(event.type) === -1) {
                    filterStorage.push(event.type);

                    filterItem = document.createElement('span');
                    filterItem.classList.add(classes.filterItem);
                    filterItem.dataset.filter = event.type;
                    filterItem.textContent = event.type;
                    elements.filter.append(filterItem);

                    filterItem.addEventListener('click', (e) => {
                        this.filter(e);
                    });
                }
            }
        });
    }

    filter(e) {
        let {classes} = this.props;

        let filterItems = document.querySelectorAll(`.${classes.filterItem}`);
        filterItems.forEach((filterItem) => {
            if (e.target.dataset.filter === filterItem.dataset.filter) {
                filterItem.classList.add(classes.filterItemActive);
            } else {
                filterItem.classList.remove(classes.filterItemActive);
            }
        });

        let items = document.querySelectorAll(`.${classes.point}`);
        items.forEach((item) => {
            if (e.target.dataset.filter === classes.showAll) {
                item.classList.remove(classes.pointInfoHide);
            } else if (e.target.dataset.filter !== item.dataset.filter) {
                item.classList.add(classes.pointInfoHide);
            } else {
                item.classList.remove(classes.pointInfoHide);
            }
        });
    }

    stopPropagationAllEvents(element) {

        element.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        element.addEventListener('mouseup', (e) => {
            e.stopPropagation();
        });

        element.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        });

        element.addEventListener('touchend', (e) => {
            e.stopPropagation();
        });
    }
}

window.heatmap = new Heatmap();