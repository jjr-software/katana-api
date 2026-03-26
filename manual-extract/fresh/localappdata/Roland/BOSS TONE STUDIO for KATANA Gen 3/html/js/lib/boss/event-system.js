class EventTargetFactory {
    /* 自身のコンストラクト不要 */
    static _eventTargets = [];
    static getEventTarget(eventTargetName) {
        /* 都度生成するわけではないため注意。FlyweightやSingletonのイメージに近い */
        if (Object.values(EVENT_TARGET_NAME).find((definedName) => definedName == eventTargetName) == undefined) {
            return undefined;
        }
        if (!this._eventTargets[eventTargetName]) this._eventTargets[eventTargetName] = new EventTarget();
        return this._eventTargets[eventTargetName];
    }
};

/* 変更時にイベントを発火するプロパティをオブジェクトに追加するユーティリティ関数 */
function addPropertyNotifyWhenChanged(obj, propertyName, propertyChangedEventName, eventTarget) {
    /* データプロパティ */
    let dataPropName = '_'+ propertyName;
    Object.defineProperty(obj, dataPropName, {
        writable: true,
        enumerable: false,
        configurable: false
    });

    /* アクセサプロパティ */
    Object.defineProperty(obj, propertyName, {
        set: function (newValue) {
            if (newValue === this[dataPropName]) return;
            let beforeVal = this[dataPropName];
            this[dataPropName] = newValue;

            let option = {
                detail: {
                    beforeValue: beforeVal,
                    value: this[dataPropName]
                }
            } 
            eventTarget.dispatchEvent(new CustomEvent(propertyChangedEventName, option));
        },
        get: function () {
            return this[dataPropName];
        },
        enumerable: true,
        configurable: false
    });
}