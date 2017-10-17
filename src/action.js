export default class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.option = {
            listPath: option.listPath,
            selectFieldName: option.selectFieldName
        }
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
    }

    isSelectAll = () => {
        const lst = this.metaAction.gf(this.option.listPath)
        if (!lst || lst.size == 0)
            return false

        return lst.every(o => o.get(this.option.selectFiledName))
    }

    selectAll = (e) => {
        this.injections.reduce('selectAll', e.target.checked)
    }

    getSelectedCount = () => {
        var lst = this.metaAction.gf(this.option.listPath)

        if (!lst || lst.size == 0)
            return 0

        var ret = lst.filter(o => !!o.get(this.option.selectFiledName)).size

        return ret
    }
}
