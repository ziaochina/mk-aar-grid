export default  class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.option = {
            listPath: option.listPath,
            selectFieldName: option.selectFieldName
        }
    }

    selectAll = (state, checked) => {
        var lst = this.metaReducer.gf(state, this.option.listPath)

        if (!lst || lst.size == 0)
            return state

        for (let i = 0; i < lst.size; i++) {
            state = this.metaReducer.sf(state, `${this.option.listPath}.${i}.${this.option.selectFiledName}`, checked)
        }

        return state
    }
}
