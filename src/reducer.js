export default  class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        if (option.gridOption) {
            this.option = option.gridOption
        }
    }

    selectAll = (state, checked, gridName) => {
        if(!this.option)
            return state

        const path = this.option[gridName].path,
            selectFieldName = this.option[gridName].selectFieldName

        var lst = this.metaReducer.gf(state, path)

        if (!lst || lst.size == 0)
            return state

        for (let i = 0; i < lst.size; i++) {
            state = this.metaReducer.sf(state, `${path}.${i}.${selectFieldName}`, checked)
        }

        return state
    }

    addRow = (state, gridName, rowIndex) => {
        if(!this.option)
            return state

        const path = this.option[gridName].path,
            emptyRow = this.option[gridName].emptyRow || {}

        var lst = this.metaReducer.gf(state, path)
        lst = lst.insert(rowIndex, Map(emptyRow))

        return this.metaReducer.sf(state, path, lst)
    }

    delRow = (state, gridName, rowIndex) => {
        if(!this.option)
            return state
        
        const path = this.option[gridName].path
        var lst = this.metaReducer.gf(state, path)

        if (rowIndex == -1)
            return state

        lst = lst.remove(rowIndex)

        //永远保证有一行
        if (lst.size == 0)
            lst = lst.insert(rowIndex, Map({}))

        return this.metaReducer.sf(state, path, lst)
    }
}
