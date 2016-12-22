//=============================================================================
// KMS_ExtendStatusScene.js
//  last update: 2016/01/01
//=============================================================================

/*:
 * @plugindesc
 * [v0.1.0] Extends status scene.
 *
 * @author TOMY (Kamesoft)
 *
 * @param Display elements
 * @default 1-9
 * @desc Specify element ids separated by ','. 'x-y' form indicates all data included between x and y.
 *
 * @param Display states
 * @default 1, 4-10
 * @desc Specify state ids separated by ','. 'x-y' form indicates all data included between x and y.
 *
 * @param Element icon index
 * @default 76, 64, 65, 66, 67, 68, 69, 70, 71, 72
 * @desc Specify icon indices for elements. The first index corresponds to element 1, the next is element 2, and so on.
 *
 * @param Caption for element
 * @default Element resistance
 * @desc Caption for element resistance.
 *
 * @param Caption for state
 * @default State resistance
 * @desc Caption for state resistance.
 *
 * @param Chart frame color
 * @default rgba(128, 192, 255, 0.9)
 * @desc Frame color for radar chart.
 *
 * @param Chart base color
 * @default rgba(128, 192, 255, 0.6)
 * @desc Background line color for radar chart.
 *
 * @param Chart line color
 * @default rgba(128, 255, 128, 1)
 * @desc Main line color for radar chart.
 *
 * @param Chart flash color C
 * @default rgba(128, 255, 128, 0.2)
 * @desc Fill color of the center for radar chart.
 *
 * @param Chart flash color E
 * @default rgba(128, 255, 128, 0.9)
 * @desc Fill color of the edge for radar chart.
 *
 * @help This plugin does not provide plugin commands.
 */

/*:ja
 * @plugindesc
 * [v0.1.0] ステータス画面の表示内容を拡張します。
 *
 * @author TOMY (Kamesoft)
 *
 * @param Display elements
 * @default 1-9
 * @desc 耐性表示する属性 ID の一覧を , 区切りで指定します。x-y 形式で、x から y の範囲を指定できます。
 *
 * @param Display states
 * @default 1, 4-10
 * @desc 耐性表示するステート ID の一覧を , 区切りで指定します。x-y 形式で、x から y の範囲を指定できます。
 *
 * @param Element icon index
 * @default 76, 64, 65, 66, 67, 68, 69, 70, 71, 72
 * @desc 属性のアイコン番号を指定します。先頭から順に属性 ID 1, 2, ... に対応します。
 *
 * @param Caption for element
 * @default 属性耐性
 * @desc 属性耐性表示のテキストです。
 *
 * @param Caption for state
 * @default ステート耐性
 * @desc ステート耐性表示のテキストです。
 *
 * @param Chart frame color
 * @default rgba(128, 192, 255, 0.9)
 * @desc レーダーチャートの枠線の色を CSS カラーで指定します。
 *
 * @param Chart base color
 * @default rgba(128, 192, 255, 0.6)
 * @desc レーダーチャート背景の線の色を CSS カラーで指定します。
 *
 * @param Chart line color
 * @default rgba(128, 255, 128, 1)
 * @desc レーダーチャート本体の線の色を CSS カラーで指定します。
 *
 * @param Chart flash color C
 * @default rgba(128, 255, 128, 0.2)
 * @desc レーダーチャートアニメの中心の色を CSS カラーで指定します。
 *
 * @param Chart flash color E
 * @default rgba(128, 255, 128, 0.9)
 * @desc レーダーチャートアニメの外側の色を CSS カラーで指定します。
 *
 * @help このプラグインには、プラグインコマンドはありません。
 */

var KMS = KMS || {};

(function()
{

KMS.imported = KMS.imported || {};
KMS.imported['ExtendStatusScene'] = true;

/*
 * ID リスト文字列を解析して ID の配列を作成
 */
var parseDisplayIdList = function(listString)
{
    var rangeReg = /(\d+)\-(\d+)/;
    var singleReg = /\d+/;
    var idList = [];
    listString.split(/\s*,\s*/).forEach(function(idString)
    {
        var match = rangeReg.exec(idString);
        if (match)
        {
            // 範囲指定
            var beginId = parseInt(match[1]);
            var endId = parseInt(match[2]);
            for (var i = beginId; i <= endId; i++)
            {
                idList.push(i);
            }
        }
        else if (singleReg.test(idString))
        {
            // 単一指定
            idList.push(parseInt(idString));
        }
    });

    // 重複を弾きつつソートしたものを返す
    return idList.filter(function(value, i, self)
    {
        return self.indexOf(value) === i;
    }).sort(function(a, b)
    {
        return a - b;
    });
};

/*
 * 属性アイコンリストの解析
 */
var parseElementIconList = function(listString)
{
    var icons = [];
    listString.split(/\s*,\s*/).forEach(function(idString, index)
    {
        var id = parseInt(idString);
        if (!Number.isNaN(id))
        {
            icons[index + 1] = id;
        }
    });

    return icons;
};

var pluginParams = PluginManager.parameters('KMS_ExtendStatusScene');
var Params = {};
Params.displayElementIds = parseDisplayIdList(
    pluginParams['Display elements'] || '1-9');
Params.displayStateIds = parseDisplayIdList(
    pluginParams['Display states'] || '1, 4-10');
Params.elementIcons = parseElementIconList(
    pluginParams['Element icon index'] || '76, 64, 65, 66, 67, 68, 69, 70, 71, 72');
Params.elementResistanceCaption = pluginParams['Caption for element'] || '属性耐性';
Params.stateResistanceCaption = pluginParams['Caption for state'] || 'ステート耐性';
Params.chartColor = {
    frame: pluginParams['Chart frame color'] || 'rgba(128, 192, 255, 0.9)',
    base: pluginParams['Chart base color'] || 'rgba(128, 192, 255, 0.6)',
    line: pluginParams['Chart line color'] || 'rgba(128, 255, 128, 1)',
    flashCenter: pluginParams['Chart flash color C'] || 'rgba(128, 255, 128, 0.2)',
    flashEdge: pluginParams['Chart flash color E'] || 'rgba(128, 255, 128, 0.9)'
};


//-----------------------------------------------------------------------------
// Bitmap

if (!Bitmap.prototype.drawLineKms)
{

/*
 * 直線の描画
 */
Bitmap.prototype.drawLineKms = function(x1, y1, x2, y2, color, width)
{
    var context = this._context;
    context.save();
    context.lineWidth = width || 1.0;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.restore();
    this._setDirty();
};

/*
 * 指定した各点を結ぶ多角形の描画
 */
Bitmap.prototype.drawPolygonKms = function(points, color, width)
{
    if (!(points instanceof Array) || points.length <= 0)
    {
        return;
    }

    var context = this._context;
    context.save();
    context.lineWidth = width || 1.0;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++)
    {
        context.lineTo(points[i].x, points[i].y);
    }
    context.closePath();
    context.stroke();
    context.restore();
    this._setDirty();
};

/*
 * 指定した円に内接する正 n 角形を描画
 */
Bitmap.prototype.drawRegularPolygonKms = function(x, y, radius, vertexCount, color, width)
{
    if (vertexCount < 1)
    {
        return;
    }

    var points = [];
    for (var i = 0; i < vertexCount; i++)
    {
        var angle = i * Math.PI * 2 / vertexCount - Math.PI / 2;
        points.push(new Point(
            x + Math.cos(angle) * radius,
            y + Math.sin(angle) * radius));
    }

    this.drawPolygonKms(points, color, width);
};

/*
 * 指定した各点を結ぶ多角形の塗り潰し
 */
Bitmap.prototype.fillRadialPolygonKms = function(center, radius, points, color1, color2)
{
    if (!(points instanceof Array) || points.length <= 0)
    {
        return;
    }

    var edgeColor = color2 || color1;
    var context = this._context;
    context.save();

    var grad = context.createRadialGradient(
        center.x, center.y, 1,
        center.x, center.y, radius);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, edgeColor);

    context.fillStyle = grad;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++)
    {
        context.lineTo(points[i].x, points[i].y);
    }
    context.closePath();
    context.fill();
    context.restore();
    this._setDirty();
};

}  // <-- if (!Bitmap.prototype.drawLineKms)


//-----------------------------------------------------------------------------
// Window_Status

var _KMS_ExtendStatusScene_Window_Status_initialize = Window_Status.prototype.initialize;
Window_Status.prototype.initialize = function()
{
    _KMS_ExtendStatusScene_Window_Status_initialize.call(this);

    this.createArrowSprites();
    this.createChartSprites();
    this._currentPage = 0;
};

Window_Status.prototype.contentsWidth = function()
{
    return (Graphics.boxWidth - this.standardPadding() * 2) * this.getPageCount();
};

Window_Status.prototype.getPageCount = function()
{
    return 3;
};

/*
 * アロースプライトの作成
 */
Window_Status.prototype.createArrowSprites = function()
{
    // あえて Window.prototype._refreshArrows に近い書き方
    var p = 12;
    var q = p * 2;
    var sx = 96 + q;
    var sy = 0 + q;

    this._leftArrowSprite = new Sprite();
    this._leftArrowSprite.bitmap = this.windowskin;
    this._leftArrowSprite.anchor.x = 0.5;
    this._leftArrowSprite.anchor.y = 0.5;
    this._leftArrowSprite.setFrame(sx, sy + p, p, q);
    this._leftArrowSprite.move(p, this.height / 2);
    this.addChild(this._leftArrowSprite);

    this._rightArrowSprite = new Sprite();
    this._rightArrowSprite.bitmap = this.windowskin;
    this._rightArrowSprite.anchor.x = 0.5;
    this._rightArrowSprite.anchor.y = 0.5;
    this._rightArrowSprite.setFrame(sx + p + q, sy + p, p, q);
    this._rightArrowSprite.move(this.width - p, this.height / 2);
    this.addChild(this._rightArrowSprite);
};

/*
 * 耐性チャートのスプライトを作成
 */
Window_Status.prototype.createChartSprites = function()
{
    this._chartDuration = 0;
    this._chartSprites = [];

    this._elementChartSprite = new Sprite();
    this._elementChartSprite.anchor.x = 0.5;
    this._elementChartSprite.anchor.y = 0.5;
    this._elementChartSprite.blendMode = Graphics.BLEND_ADD;
    this._elementChartSprite.opacity = 0;
    this._elementChartSprite.visible = false;
    this.addChild(this._elementChartSprite);
    this._chartSprites.push(this._elementChartSprite);

    this._stateChartSprite = new Sprite();
    this._stateChartSprite.anchor.x = 0.5;
    this._stateChartSprite.anchor.y = 0.5;
    this._stateChartSprite.blendMode = Graphics.BLEND_ADD;
    this._stateChartSprite.opacity = 0;
    this._stateChartSprite.visible = false;
    this.addChild(this._stateChartSprite);
    this._chartSprites.push(this._stateChartSprite);
};

var _KMS_ExtendStatusScene_Window_Status_refresh = Window_Status.prototype.refresh;
Window_Status.prototype.refresh = function()
{
    _KMS_ExtendStatusScene_Window_Status_refresh.call(this);

    if (this._actor)
    {
        for (var i = 1; i < this.getPageCount() ; i++)
        {
            this.drawPage(i);
        }
    }
};

/*
 * 指定ページの描画
 */
Window_Status.prototype.drawPage = function(pageIndex)
{
    if (pageIndex < 0 || pageIndex >= this.getPageCount())
    {
        return;
    }

    var pageWidth = this.contentsWidth() / this.getPageCount();
    var dx = pageIndex * pageWidth;
    var dy = this.lineHeight() * 7;
    var dh = this.contentsHeight() - dy;

    // 水平線が貫通してきているので一旦消去
    this.contents.clearRect(dx, 0, pageWidth, this.contentsHeight());

    switch (pageIndex)
    {
        case 1:
            this.drawElementResistance(dx + 8, dy, pageWidth - 16, dh);
            break;
        case 2:
            this.drawStateResistance(dx + 8, dy, pageWidth - 16, dh);
            break;
    }

    // 前半は page0 (通常のステータス画面) の内容をコピー
    this.contents.blt(this.contents, 0, 0, pageWidth, dy - 1, dx, 0);
};

/*
 * 属性耐性を描画
 */
Window_Status.prototype.drawElementResistance = function(x, y, width, height)
{
    this.changeTextColor(this.systemColor());
    this.drawText(Params.elementResistanceCaption, x, y, width);
    this.resetTextColor();

    var paramFunc = function(elementId)
    {
        return {
            rate: this._actor.elementRate(elementId),
            icon: Params.elementIcons[elementId] || 0
        };
    };

    this.drawResistanceChart(
        paramFunc,
        Params.displayElementIds,
        this._elementChartSprite,
        x, y, width, height);

    var lineHeight = this.lineHeight();
    y += lineHeight;
    height -= lineHeight;

    this.drawResistanceList(function(elementId, dx, dy, dw) {
        var param = paramFunc.call(this, elementId);
        this.drawResistance(param.rate, param.icon, dx, dy, dw);
    }, Params.displayElementIds, x, y, width, height);
};

/*
 * ステート耐性を描画
 */
Window_Status.prototype.drawStateResistance = function(x, y, width, height)
{
    this.changeTextColor(this.systemColor());
    this.drawText(Params.stateResistanceCaption, x, y, width);
    this.resetTextColor();

    var paramFunc = function(stateId)
    {
        return {
            rate: this._actor.isStateResist(stateId) ? 0 : this._actor.stateRate(stateId),
            icon: $dataStates[stateId].iconIndex
        };
    };

    this.drawResistanceChart(
        paramFunc,
        Params.displayStateIds,
        this._stateChartSprite,
        x, y, width, height);

    var lineHeight = this.lineHeight();
    y += lineHeight;
    height -= lineHeight;

    this.drawResistanceList(function(stateId, dx, dy, dw) {
        var param = paramFunc.call(this, stateId);
        this.drawResistance(param.rate, param.icon, dx, dy, dw);
    }, Params.displayStateIds, x, y, width, height);
};

/*
 * 耐性一覧を描画
 */
Window_Status.prototype.drawResistanceList = function(drawFunc, idList, x, y, width, height)
{
    var lineHeight = this.lineHeight();
    var lineMax = Math.floor(height / lineHeight);
    idList.forEach(function(id, index)
    {
        var dw = 116;
        var dx = x + (dw + 24) * Math.floor(index / lineMax);
        var dy = y + lineHeight * (index % lineMax);
        drawFunc.call(this, id, dx, dy, dw);
    }, this);
};

/*
 * 耐性をアイコン付きで描画
 */
Window_Status.prototype.drawResistance = function(value, iconIndex, x, y, width)
{
    this.drawIcon(iconIndex, x, y);
    var offset = Window_Base._iconWidth + 4;
    this.drawText(Math.floor(100 - value * 100) + '%', x + offset, y, width - offset, 'right');
};

/*
 * 耐性チャートを描画
 */
Window_Status.prototype.drawResistanceChart = function(paramFunc, idList, sprite, x, y, width, height)
{
    var iconSize = { width: Window_Base._iconWidth, height: Window_Base._iconHeight };
    var chartPosition = {
        x: x + width - height / 2,
        y: y + height / 2
    };
    var radius = (height - iconSize.height * 3) / 2;

    // 枠線の描画
    this.contents.drawRegularPolygonKms(
        chartPosition.x,
        chartPosition.y,
        radius,
        idList.length,
        Params.chartColor.frame,
        2);
    this.contents.drawRegularPolygonKms(
        chartPosition.x,
        chartPosition.y,
        radius / 2,
        idList.length,
        Params.chartColor.base,
        1);

    var pageWidth = this.contentsWidth() / this.getPageCount();
    sprite.x = chartPosition.x % pageWidth + this.standardPadding();
    sprite.y = chartPosition.y + this.standardPadding();
    sprite.bitmap = new Bitmap(radius * 2, radius * 2);

    // 多角形の座標を計算しつつ、残りの枠線を描画
    var points = [];
    idList.forEach(function(id, index)
    {
        var param = paramFunc.call(this, id);
        var chartRadius = (radius * (2 - param.rate) / 2).clamp(0, radius);
        var angle = index * Math.PI * 2 / idList.length - Math.PI / 2;
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var point = new Point(
            chartPosition.x + cos * chartRadius,
            chartPosition.y + sin * chartRadius);
        points.push(point);

        this.contents.drawLineKms(
            chartPosition.x,
            chartPosition.y,
            chartPosition.x + cos * radius,
            chartPosition.y + sin * radius,
            Params.chartColor.base,
            1);
        this.drawIcon(
            param.icon,
            chartPosition.x + cos * (radius + iconSize.width / 2 + 6) - iconSize.width / 2,
            chartPosition.y + sin * (radius + iconSize.height / 2 + 6) - iconSize.height / 2);
    }, this);

    // チャート本体を描画
    this.contents.drawPolygonKms(points, Params.chartColor.line, 2);

    // 座標をスプライト仕様に調整してチャート内部を描画
    points.forEach(function(point)
    {
        point.x -= chartPosition.x - radius;
        point.y -= chartPosition.y - radius;
    });
    var center = new Point(radius, radius);
    sprite.bitmap.fillRadialPolygonKms(
        center,
        radius,
        points,
        Params.chartColor.flashCenter,
        Params.chartColor.flashEdge);
};

/*
 * 指定したページの表示
 */
Window_Status.prototype.showPage = function(pageIndex)
{
    if (pageIndex < 0 || pageIndex >= this.getPageCount())
    {
        return;
    }

    var pageWidth = this.contentsWidth() / this.getPageCount();
    this.origin.x = pageWidth * pageIndex;

    this._elementChartSprite.visible = false;
    this._stateChartSprite.visible = false;

    var chartSprite = null;
    switch (pageIndex)
    {
        case 1: chartSprite = this._elementChartSprite; break;
        case 2: chartSprite = this._stateChartSprite; break;
    }

    if (chartSprite)
    {
        // チャート表示アニメを初期化
        this._chartDuration = 0;
        chartSprite.opacity = 255;
        chartSprite.scale.x = 0;
        chartSprite.scale.y = 0;
        chartSprite.visible = true;
    }

    this._currentPage = pageIndex;
};

/*
 * 指定した数だけページを移動
 */
Window_Status.prototype.movePage = function(amount)
{
    var pageCount = this.getPageCount();
    amount %= pageCount;
    this.showPage((this._currentPage + amount + pageCount) % pageCount);
};

var _KMS_ExtendStatusScene = Window_Status.prototype.update;
Window_Status.prototype.update = function()
{
    _KMS_ExtendStatusScene.call(this);

    this.updateChartSprites();
};

/*
 * 耐性チャートスプライトの更新
 */
Window_Status.prototype.updateChartSprites = function()
{
    this._chartSprites.forEach(function(sprite)
    {
        var duration = this._chartDuration;
        if (duration < 12)
        {
            // 拡大
            sprite.scale.x = duration / 11;
            sprite.scale.y = sprite.scale.x;
            sprite.opacity = 255;
        }
        else if (duration < 28)
        {
            // フェードアウト
            sprite.opacity = (27 - duration) * 16;
        }
        else
        {
            sprite.scale.x = sprite.scale.y = 0;
        }
    }, this);

    this._chartDuration = (this._chartDuration + 1) % 60;
};


//-----------------------------------------------------------------------------
// Scene_Status

var _KMS_ExtendStatusScene_update = Scene_Status.prototype.update;
Scene_Status.prototype.update = function()
{
    _KMS_ExtendStatusScene_update.call(this);

    this.processChangePage();
};

Scene_Status.prototype.processChangePage = function()
{
    if (Input.isTriggered('left'))
    {
        SoundManager.playCursor();
        this._statusWindow.movePage(-1);
    }
    else if (Input.isTriggered('right'))
    {
        SoundManager.playCursor();
        this._statusWindow.movePage(1);
    }
};

})();
