class Heatmap {
    constructor() {
        this.props = {
            elements: {
                body: document.body
            },
            classes: {
                point: 'point',
                adding: 'adding',
                pointInfo: 'pointInfo'
            },
            data: {
                sessionId: null,
                events: null
            },
        };

        this.init();
    }

    init() {
        this.networkData();
        this.events();
        this.createPointAfterError();
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

    pushData(e) {
        let {data} = this.props;

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

        sessionStorage.setItem('sessionEvents', JSON.stringify(data.events));
    }

    createPointAfterError() {
        let {data} = this.props;

        if (data.events.length > 0) {
            data.events.forEach((e) => {
                this.createPoint(e, false);
            });
        }
    };

    events() {
        let {elements: {body}} = this.props, handler;

        body.addEventListener('mousedown', (e) => {
            this.createPoint(e);

            body.addEventListener('mousemove', handler = (e) => {
                console.log(e);
                this.createPoint(e);
            });
        });

        body.addEventListener('mouseup', (e) => {
            this.createPoint(e);

            body.removeEventListener('mousemove', handler);
        });
    }

    createPoint(e, bool = true) {
        let {elements: {body}, classes} = this.props;

        let point = document.createElement('span');
        point.classList.add(classes.point);
        point.classList.add(classes.adding);
        point.classList.add(e.type);
        point.style.left = `${e.pageX - 15}px`;
        point.style.top = `${e.pageY - 15}px`;
        body.append(point);

        if (bool === true) {
            this.pushData(e);
        }
        this.createPointInfo(point, e);

        setTimeout(function () {
            point.classList.remove(classes.adding);
        }, 100);
    }

    createPointInfo(point, e) {
        let {classes, data} = this.props;

        let pointInfo = document.createElement('span');
        pointInfo.classList.add(classes.pointInfo);
        pointInfo.innerHTML = `
        <span>sessionId: ${data.sessionId}</span>
        <span>timestamp: ${e.timeStamp}</span>
        <span>type: ${e.type}</span>
        <span>coordinates<br>x: ${e.pageX}, y: ${e.pageY}</span>
        <span>screen: ${e.target.nodeName}</span>
        `;
        point.append(pointInfo);
    }

}

window.heatmap = new Heatmap();