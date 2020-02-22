class TitleState {
    constructor(value) {
        this.value = value || 'My Title';
    }

    update(ops) {
        if (ops.length > 0) {
            this.value = ops[ops.length - 1].after;
        }
    }

    copy() {
        return new TitleState(this.value);
    }
}

export { TitleState };
