import utils from 'mk-utils'

export default class action {
    constructor(option) {
        this.metaAction = option.metaAction
        if (option.gridOption) {
            this.option = option.gridOption
        }
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
    }

    isSelectAll = (gridName) => {
        if (!this.option)
            return

        if(!( typeof gridName == 'string' && gridName)){
            gridName = Object.keys(this.option)[0]
        }

        const lst = this.metaAction.gf(this.option[gridName].path)
        if (!lst || lst.size == 0)
            return false

        return lst.every(o => o.get(this.option[gridName].selectFieldName))
    }

    selectAll = (gridName) => (e) => {
        if (!this.option)
            return


        if(!( typeof gridName == 'string' && gridName)){
            gridName = Object.keys(this.option)[0]
        }

        this.injections.reduce('selectAll', e.target.checked, gridName)
    }

    getSelectedCount = (gridName) => {
        if (!this.option)
            return


        if(!( typeof gridName == 'string' && gridName)){
            gridName = Object.keys(this.option)[0]
        }

        var lst = this.metaAction.gf(this.option[gridName].path)

        if (!lst || lst.size == 0)
            return 0

        var ret = lst.filter(o => !!o.get(this.option[gridName].selectFieldName)).size

        return ret
    }

    mousedown = (e) => {
        if (!this.option)
            return

        const path = utils.path.findPathByEvent(e)
        if (this.metaAction.isFocus(path)) return

        if (path.indexOf('cell.cell') != -1) {
            this.focusCell(this.getCellInfo(path), path)
        }
        else {
            if (!this.metaAction.focusByEvent(e)) return
            setTimeout(this.cellAutoFocus, 16)
        }
    }

    gridKeydown = (e) => {
        if (!this.option)
            return

        var path = ''

        if (e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 13 || e.keyCode == 108 || e.keyCode == 9 || e.keyCode == 38 || e.keyCode == 40) {
            path = utils.path.findPathByEvent(e)
            if (!path || path.indexOf(',') == -1)
                return
        }

        //37:左键
        if (e.keyCode == 37) {
            if (!utils.dom.cursorAtBegin(e)) return
            this.moveEditCell(path, 'left')
            return
        }

        //39:右键 13:回车 108回车 tab:9
        if (e.keyCode == 39 || e.keyCode == 13 || e.keyCode == 108 || e.keyCode == 9) {
            if (!utils.dom.cursorAtEnd(e)) return
            this.moveEditCell(path, 'right')
            return
        }

        //38:上键
        if (e.keyCode == 38) {
            this.moveEditCell(path, 'up')
            return
        }

        //40:下键
        if (e.keyCode == 40) {
            this.moveEditCell(path, 'down')
            return
        }

    }


    moveEditCell(path, action) {
        const cellInfo = this.getCellInfo(path)
        this.moveCell(cellInfo, action, path)
    }

    moveCell(cellInfo, action, path) {
        var isReadOnly = (cellPosition, path) => {
            /*
            if (path.indexOf('unitGrid') != -1) {
                if (cellPosition.x == 2) {
                    return true
                }
            }*/
            return false
        }

        const gridNames = Object.keys(this.option)

        for (var name of gridNames) {
            if (path.indexOf(name) != -1 && this.option[name].isReadOnly) {
                isReadOnly = this.option[name].isReadOnly
            }
        }

        const position = utils.matrix.move(cellInfo.rowCount, cellInfo.colCount, { x: cellInfo.x, y: cellInfo.y }, action)
        if (isReadOnly(position, path)) {
            this.moveCell(position, action, path)
        } else {
            this.focusCell(position, path)
        }
    }

    focusCell(position, path) {
        const gridNames = Object.keys(this.option)
        for (var name of gridNames) {
            if (path.indexOf(name) != -1) {
                let colPathPrefix = this.getColPathPrefix(path, name)
                this.metaAction.sfs({
                    'data.other.focusFieldPath': `${colPathPrefix}${this.option[name].colNames[position.x]}.cell.cell,${position.y}`,
                    [`data.other.${name}ScrollToRow`]: position.y,
                    [`data.other.${name}ScrollToColumn`]: position.x + 1
                })
            }
        }
        setTimeout(this.cellAutoFocus, 16)
    }

    getColPathPrefix(path, gridName){
        return path.substring(0, path.indexOf(gridName)) + gridName + '.columns.'
    }

    getCellInfo(path) {
        if (!this.option)
            return

        const parsedPath = utils.path.parsePath(path)
        const gridNames = Object.keys(this.option)

        for (var name of gridNames) {
            if (path.indexOf(name) != -1) {
                let colPathPrefix = this.getColPathPrefix(path, name)
                const rowCount = this.metaAction.gf(this.option[name].path).size
                const colCount = this.option[name].colCount
                var colName = parsedPath.path
                    .replace(colPathPrefix, '')
                    .replace('.cell.cell', '')
                    .replace(/\s/g, '')

                return {
                    x: this.option[name].colNames.findIndex(o => o == colName),
                    y: Number(parsedPath.vars[0]),
                    colCount,
                    rowCount,
                }
            }
        }
    }


    cellAutoFocus = () => {
        utils.dom.gridCellAutoFocus(this.component, '.editable-cell')
    }

    getCellClassName = (path, align, gridName) => {
        if (!this.option)
            return

        if(!( typeof gridName == 'string' && gridName)){
            gridName = Object.keys(this.option)[0]
        }

        const defaultClsName = this.option[gridName].cellClassName

        var clsName = this.metaAction.isFocus(path) ? `${defaultClsName} editable-cell` : ''

        if (align) {
            clsName += ` ${defaultClsName}-${align}`
        }
        return clsName
    }

    addRow = (gridName) => (ps) => {
        this.injections.reduce('addRow', gridName, ps.rowIndex + 1)
    }

    delRow = (gridName) => (ps) => {
        this.injections.reduce('delRow', gridName, ps.rowIndex)
    }
}
