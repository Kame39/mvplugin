//=============================================================================
// KMS_ScrollOffset.js
//   Last update: 2017/02/04
//=============================================================================

/*:
 * @plugindesc
 * [v0.1.0] Set the number of lines which are displayed above and below the cursor.
 * 
 * @author TOMY (Kamesoft)
 *
 * @param Line number
 * @default 1
 * @desc The number of lines which are displayed above and below the cursor.
 *
 * @help This plugin does not provide plugin commands.
 */

/*:ja
 * @plugindesc
 * [v0.1.0] リストのスクロール時に、カーソル位置の上下に表示する行数を指定する機能を追加します。
 * 
 * @author TOMY (Kamesoft)
 *
 * @param Line number
 * @default 1
 * @desc カーソルの上下に表示する行数を指定します。
 *
 * @help このプラグインには、プラグインコマンドはありません。
 */

var KMS = KMS || {};

(function() {

'use strict';

var PluginName = 'KMS_ScrollOffset';

KMS.imported = KMS.imported || {};
KMS.imported['ScrollOffset'] = true;

var pluginParams = PluginManager.parameters(PluginName);
var Params = {};
Params.offset = Number(pluginParams['Line number'] || 1);


//-----------------------------------------------------------------------------
// Window_Selectable

var _Window_Selectable_ensureCursorVisible = Window_Selectable.prototype.ensureCursorVisible;
Window_Selectable.prototype.ensureCursorVisible = function()
{
    // 上下に表示する行数が足りない場合はデフォルトの表示方式
    if (this.maxPageRows() <= Params.offset * 2)
    {
        _Window_Selectable_ensureCursorVisible.call(this);
        return;
    }

    var row = this.row();
    if (row < this.topRow() + Params.offset)
    {
        this.setTopRow(Math.max(row - Params.offset, 0));
    }
    else if (row > this.bottomRow() - Params.offset)
    {
        this.setBottomRow(Math.min(row + Params.offset, this.maxRows()));
    }
};

})();
