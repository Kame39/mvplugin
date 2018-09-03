//=============================================================================
// KMS_NonAntiAliasedText.js
//   Last update: 2018/09/03
//=============================================================================

/*:
 * @plugindesc
 * [v0.1.1α] Add a function to draw text without anti-aliasing.
 * 
 * @author Kameo (Kamesoft)
 *
 * @param Default draw method
 * @default 1
 * @desc Specify the default drawing method as integer between 0-2.
 *
 * @param Binarize threshold
 * @default 128
 * @desc Specify the threshold as integer between 1-255 for removing anti-alias.
 *
 * @param Base font size
 * @default 18
 * @desc Specify the base font size which is used by draw method 1 and 2.
 *
 * @param Enable force non-AA
 * @default 0
 * @desc Set to 1, disable anti-aliasing for Bitmap.drawText().
 *
 * @param Associate switch ID
 * @default 0
 * @desc Associate the switch ID with enabling non-AA. This works when "Enable force non-AA" is 1.
 *
 * @help
 *
 * ## Plugin command
 *
 * No plugin commands.
 *
 */

/*:ja
 * @plugindesc
 * [v0.1.1α] アンチエイリアス効果を除去してテキストを描画する機能を追加します。
 * 
 * @author かめお (Kamesoft)
 *
 * @param Default draw method
 * @default 1
 * @desc デフォルトの描画方式を 0 ～ 2 の整数で指定します。
 *
 * @param Binarize threshold
 * @default 128
 * @desc
 * アンチエイリアス除去の強度を 1 ～ 255 の範囲で指定します。
 * 大きいほど文字が細く、小さいほど太く見えます。
 *
 * @param Base font size
 * @default 18
 * @desc 描画方式 1 と 2 で使用する、基準となるフォントサイズを指定します。大きいほど描画負荷が高くなります。
 *
 * @param Enable force non-AA
 * @default 0
 * @desc 1 にすると、すべてのテキストをアンチエイリアス除去して描画します。
 *
 * @param Associate switch ID
 * @default 0
 * @desc
 * 指定した ID のスイッチを、除去機能の ON/OFF に割り当てます。
 * Enable force non-AA が 1 のときのみ有効です。
 *
 * @help
 *
 * ■ 設定
 *
 * 使用するフォントに合わせて「Default draw method」「Binarize threshold」「Base font size」を調整してください。
 *
 * すべてのテキストからアンチエイリアスを除去するには、「Enable force non-AA」 を 1 にしてください。
 *
 * ■ プラグインコマンド
 *
 * プラグインコマンドはありません。
 *
 */

var KMS = KMS || {};

(function() {

'use strict';

// 定数
var Const =
{
    debug:      false,                  // デバッグモード
    pluginCode: 'NonAntiAliasedText',   // プラグインコード

    colorAlphaCacheMax: 64              // アルファ値キャッシュの最大数
};

var PluginName = 'KMS_' + Const.pluginCode;

KMS.imported = KMS.imported || {};
KMS.imported[Const.pluginCode] = true;

// デフォルト値つきで値を取得
function getWithDefault(value, defaultValue)
{
    return value === undefined ? defaultValue : value;
}

// デフォルト値つきで文字列から int を解析
function parseIntWithDefault(param, defaultValue)
{
    var value = parseInt(param);
    return isNaN(value) ? defaultValue : value;
}

var pluginParams = PluginManager.parameters(PluginName);
var Params = {};
Params.enableForceNonAa = parseIntWithDefault(pluginParams['Enable force non-AA'], 0) !== 0;
Params.enableNonAaOutline = parseIntWithDefault(pluginParams['Enable non-AA outline'], 1) !== 0;
Params.binarizeThreshold = parseIntWithDefault(pluginParams['Binarize threshold'], 0x80).clamp(0x01, 0xFF);
Params.defaultMethod = parseIntWithDefault(pluginParams['Default draw method'], 0);
Params.baseFontSize = parseIntWithDefault(pluginParams['Base font size'], 18);
Params.associatedSwitchId = parseIntWithDefault(pluginParams['Associate switch ID'], 0);

// デバッグ機能
var debuglog;
var drawTextAreaForDebug;
if (Const.debug)
{
    debuglog = function() { console.log(arguments); };

    // テキストの描画範囲を可視化
    drawTextAreaForDebug = function(context, x, y, width, height)
    {
        // 既に context.save() されている前提
        context.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        context.lineWidth   = 1;
        context.rect(x, y, width, height);
        context.stroke();
        context.restore();

        context.save();
    };
}
else
{
    debuglog = function() { };

    drawTextAreaForDebug = function(context, x, y, width, height) { };
}


//-----------------------------------------------------------------------------
// Bitmap

// 色情報の正規表現解析を減らすためのキャッシュ
Bitmap.colorAlphaCache = {};

Bitmap.prototype.drawTextDefault = Bitmap.prototype.drawText;

/*
 * デフォルトのアンチエイリアス除去方法の設定
 */
Bitmap.setDefaultDrawTextNaMethod = function(methodType)
{
    var newMethod =
        methodType === 1 ? Bitmap.prototype.drawTextNaa1 :
        methodType === 2 ? Bitmap.prototype.drawTextNaa2 :
            Bitmap.prototype.drawTextNaa0;

    // 現在 drawTextNaa がデフォルトになっている場合は新しいメソッドに差し替える
    if (Bitmap.prototype.drawText === Bitmap.prototype.drawTextNaa)
    {
        Bitmap.prototype.drawText = newMethod;
    }

    Bitmap.prototype.drawTextNaa = newMethod;
};

/*
 * デフォルトで drawText をアンチエイリアス除去にするか切り替える
 */
Bitmap.updateForceNonAa = function(enabled)
{
    if (enabled)
    {
        Bitmap.prototype.drawText = Bitmap.prototype.drawTextNaa;
    }
    else
    {
        Bitmap.prototype.drawText = Bitmap.prototype.drawTextDefault;
    }
};

/*
 * CSS カラー文字列からアルファ値を取得する
 */
function parseAlphaFromCssColor(color, defaultValue)
{
    if (!color)
    {
        return defaultValue;
    }

    if (Bitmap.colorAlphaCache.hasOwnProperty(color))
    {
        // キャッシュから取得
        return Bitmap.colorAlphaCache[color];
    }

    var alpha = defaultValue;

    // 色情報からアルファ値を抜き出す
    var match = color.match(/rgba\([\d.]+,\s*[\d.]+,\s*[\d.]+,\s*(\d+\.\d+)\)/);
    if (match)
    {
        alpha = parseFloat(match[1]);
    }

    // キャッシュに追加
    Bitmap.colorAlphaCache[color] = alpha;

    // キャッシュが増えたら古いものを消す
    var keys = Object.keys(Bitmap.colorAlphaCache);
    if (keys.length > Const.colorAlphaCacheMax)
    {
        delete Bitmap.colorAlphaCache[keys[0]];
    }

    return alpha;
}

/*
 * 画像の指定範囲を二値化
 */
function binarizeImage(context, x, y, width, height, config)
{
    config = config || {};
    var threshold  = getWithDefault(config.threshold, Params.binarizeThreshold);
    var localAlpha = getWithDefault(config.alpha, 1);
    localAlpha = parseAlphaFromCssColor(config.color, localAlpha);
    threshold  = Math.ceil(threshold * context.globalAlpha * localAlpha);

    // 各ピクセルのアルファ値だけ二値化
    var fgValue = Math.ceil(0xFF * context.globalAlpha * localAlpha);
    var image   = context.getImageData(x, y, width, height);
    var data    = image.data;
    for (var i = 0; i < data.length; i += 4)
    {
        data[i + 3] = data[i + 3] >= threshold ? fgValue : 0x00;
    }

    context.putImageData(image, x, y);
}

/*
 * イメージ描画時のスムージングを無効化
 */
function disableSmoothing(context)
{
    context.imageSmoothingEnabled       = false;  // standard
    context.mozImageSmoothingEnabled    = false;  // Firefox
    context.oImageSmoothingEnabled      = false;  // Opera
    context.webkitImageSmoothingEnabled = false;  // Safari
    context.msImageSmoothingEnabled     = false;  // IE
}

/*
 * 一時描画用のキャンバスを作成
 */
function createFontCanvas()
{
    var canvas = document.createElement('canvas');
    canvas.id     = 'KmsNonAaFontCanvas';
    canvas.width  = Graphics.width * 2;
    canvas.height = Graphics.height;

    disableSmoothing(canvas.getContext('2d'));

    Bitmap.kmsNonAntiAliasFontCanvas = canvas;
}

/*
 * はみ出た分が途切れないように描画位置・高さを調整
 */
function calcLineOffset(lineHeight, fontSize)
{
    var threshold = Math.round(fontSize * 1.6);
    var offset = { y: 0, height: 0 };

    if (lineHeight < threshold)
    {
        var diff = threshold - lineHeight;
        offset.y      = -Math.round(diff / 2);
        offset.height = diff;
    }

    return offset;
}

/*
 * 描画先の X 座標補正を計算
 */
function calcDestOffsetX(maxWidth, config, metrics, align)
{
    var destOffsetBase = Math.max(maxWidth - metrics.width / config.baseScale, 0) - config.tx;
    var destX = 0;
    if (align === 'center')
    {
        destX += Math.round(destOffsetBase / 2);
    }
    else if (align === 'right')
    {
        destX += Math.floor(destOffsetBase);
    }

    return destX;
}

/*
 * 一時キャンバスから本来のキャンバスに転送
 */
function transferTempToDest(destContext, tempCanvas, x, y, width, height, config, metrics, align)
{
    var destX = x + calcDestOffsetX(width, config, metrics, align);

    disableSmoothing(destContext);
    destContext.drawImage(
        tempCanvas,
        0,
        0,
        config.baseMaxWidth + config.tx,
        config.baseLineHeight,
        destX,
        y,
        width,
        height
    );
    destContext.drawImage(
        tempCanvas,
        0,
        config.bufferLineOffset,
        config.baseMaxWidth + config.tx,
        config.baseLineHeight,
        destX,
        y,
        width,
        height
    );
}

/*
 * フォント描画後のコンテキスト後始末
 */
function cleanupNaaFontContext(isForceRefresh)
{
    this._context.restore();
    var fontContext = Bitmap.kmsNonAntiAliasFontCanvas.getContext('2d');
    fontContext.restore();

    if (isForceRefresh || Const.debug)
    {
        this._setDirty();
    }
}

/*
 * 一時描画のための情報を生成
 */
Bitmap.prototype._createNaTextConfig = function(maxWidth, lineHeight)
{
    var realBaseScale = Params.baseFontSize / this.fontSize;
    var config =
    {
        // 負荷軽減のため、座標とサイズを基準フォントサイズに合わせる
        // ドット感が損なわれないように、スケールが 1 を超える場合は 1 に補正する
        baseScale: Math.min(realBaseScale, 1),
        baseFontSize: Math.floor(Params.baseFontSize / Math.max(realBaseScale, 1))
    };

    config.baseMaxWidth     = Math.max(Math.round(maxWidth * config.baseScale), 1);
    config.baseLineHeight   = Math.max(Math.round(lineHeight * config.baseScale), 1);
    config.bufferLineOffset = Math.max(lineHeight, config.baseLineHeight);
    config.tx               = Math.floor(this.outlineWidth / 2);
    config.ty               = Math.round(config.baseLineHeight - (config.baseLineHeight - config.baseFontSize * 0.7) / 2);

    return config;
};

/*
 * 加工前の基準フォントを取得
 */
Bitmap.prototype._makeBaseFontNameText = function(size)
{
    return (this.fontItalic ? 'Italic ' : '') +
        (size ? size : Params.baseFontSize) + 'px ' + this.fontFace;
};

/*
 * 一時描画用のコンテキストを設定
 * 使い終わったら context.restore() することを想定
 */
Bitmap.prototype._setupNaFontContext = function(config)
{
    var fontCanvas = Bitmap.kmsNonAntiAliasFontCanvas;

    // Note: Firefox has a bug with textBaseline: Bug 737852
    //       So we use 'alphabetic' here.
    var fontContext = fontCanvas.getContext('2d');
    fontContext.save();
    fontContext.clearRect(0, 0, config.baseMaxWidth + this.outlineWidth * 2, config.bufferLineOffset * 2);
    fontContext.font         = this._makeBaseFontNameText(config.baseFontSize);
    fontContext.textAlign    = 'left';
    fontContext.textBaseline = 'alphabetic';
    fontContext.globalAlpha  = 1;

    return fontContext;
};

/*
 * アンチエイリアスを除去して文字列を描画する : 縁取り
 */
Bitmap.prototype._drawTextNaaOutline = function(context, text, x, y, offsetY, maxWidth, height, metrics, scale)
{
    context.strokeStyle = this.outlineColor;
    context.lineWidth   = Math.ceil(this.outlineWidth * scale);
    context.lineJoin    = 'round';
    context.strokeText(text, x, y + offsetY, maxWidth);

    if (Params.enableNonAaOutline)
    {
        binarizeImage(
            context,
            x,
            offsetY,
            Math.min(metrics.width, maxWidth),
            height,
            { color: context.strokeStyle }
        );
    }
};

/*
 * アンチエイリアスを除去して文字列を描画する : 本体
 */
Bitmap.prototype._drawTextNaaBody = function(context, text, x, y, offsetY, maxWidth, height, metrics)
{
    context.fillStyle = this.textColor;
    context.fillText(text, x, y + offsetY, maxWidth);
    binarizeImage(
        context,
        x,
        offsetY,
        Math.min(metrics.width, maxWidth),
        height,
        { color: context.fillStyle }
    );
};

/*
 * アンチエイリアスを除去して文字列を描画する : method 0 (二値化)
 */
Bitmap.prototype.drawTextNaa0 = function(text, x, y, maxWidth, lineHeight, align)
{
    if (text === undefined || maxWidth <= 0 || lineHeight <= 0)
    {
        return;
    }

    if (!Bitmap.kmsNonAntiAliasFontCanvas)
    {
        createFontCanvas();
    }

    var lineOffset = calcLineOffset(lineHeight, this.fontSize);
    y          += lineOffset.y;
    lineHeight += lineOffset.height;

    var tx = this.outlineWidth / 2;
    var ty = lineHeight - (lineHeight - this.fontSize * 0.7) / 2;
    var bufferLineOffset = Math.floor(lineHeight * 1.2);

    var fontCanvas = Bitmap.kmsNonAntiAliasFontCanvas;
    maxWidth = maxWidth || fontCanvas.width;

    var context = this._context;
    var alpha = context.globalAlpha;
    context.save();
    drawTextAreaForDebug(context, x, y, maxWidth, lineHeight);

    // Note: Firefox has a bug with textBaseline: Bug 737852
    //       So we use 'alphabetic' here.
    var fontContext = fontCanvas.getContext('2d');
    fontContext.clearRect(0, 0, maxWidth + this.outlineWidth * 2, bufferLineOffset * 2);
    fontContext.save();
    fontContext.font         = this._makeFontNameText();
    fontContext.textAlign    = 'left';
    fontContext.textBaseline = 'alphabetic';
    fontContext.globalAlpha  = 1;

    var metrics = fontContext.measureText(text);
    if (metrics.width <= 0)
    {
        cleanupNaaFontContext.call(this);
        return;
    }

    // 二値化した枠と本体を別の領域に書く
    this._drawTextNaaOutline(fontContext, text, tx, ty, 0, maxWidth, lineHeight, metrics, 1);
    fontContext.globalAlpha = alpha;
    this._drawTextNaaBody(fontContext, text, tx, ty, bufferLineOffset, maxWidth, lineHeight, metrics);

    var destX = x + calcDestOffsetX(maxWidth, { baseScale: 1, tx: this.outlineWidth / 2 }, metrics, align);

    // キャンバスから Bitmap に転送
    disableSmoothing(context);
    context.drawImage(fontCanvas, 0, 0, maxWidth + tx, lineHeight, destX, y, maxWidth, lineHeight);
    context.drawImage(fontCanvas, 0, bufferLineOffset, maxWidth + tx, lineHeight, destX, y, maxWidth, lineHeight);

    cleanupNaaFontContext.call(this, true);
};

/*
 * アンチエイリアスを除去して文字列を描画する : method 1 (小サイズ二値化 + 拡大)
 */
Bitmap.prototype.drawTextNaa1 = function(text, x, y, maxWidth, lineHeight, align)
{
    if (text === undefined || maxWidth <= 0 || lineHeight <= 0)
    {
        return;
    }

    if (!Bitmap.kmsNonAntiAliasFontCanvas)
    {
        createFontCanvas();
    }

    var lineOffset = calcLineOffset(lineHeight, this.fontSize);
    y          += lineOffset.y;
    lineHeight += lineOffset.height;

    var fontCanvas = Bitmap.kmsNonAntiAliasFontCanvas;
    maxWidth = maxWidth || fontCanvas.width;

    var config = this._createNaTextConfig(maxWidth, lineHeight);

    var context = this._context;
    var alpha = context.globalAlpha;
    context.save();
    drawTextAreaForDebug(context, x, y, maxWidth, lineHeight);

    // フォント用キャンバスに基準サイズで描画
    var fontContext = this._setupNaFontContext(config);
    var metrics = fontContext.measureText(text);
    if (metrics.width <= 0)
    {
        cleanupNaaFontContext.call(this);
        return;
    }

    // 二値化した枠と本体を別の領域に書く
    this._drawTextNaaOutline(
        fontContext,
        text,
        config.tx,
        config.ty,
        0,
        config.baseMaxWidth,
        config.baseLineHeight,
        metrics,
        config.baseScale
    );
    fontContext.globalAlpha = alpha;
    this._drawTextNaaBody(
        fontContext,
        text,
        config.tx,
        config.ty,
        config.bufferLineOffset,
        config.baseMaxWidth,
        config.baseLineHeight,
        metrics
    );

    transferTempToDest(context, fontCanvas, x, y, maxWidth, lineHeight, config, metrics, align);

    cleanupNaaFontContext.call(this, true);
};

/*
 * アンチエイリアスを除去して文字列を描画する : method 2 (小サイズ通常描画 + 拡大)
 */
Bitmap.prototype.drawTextNaa2 = function(text, x, y, maxWidth, lineHeight, align)
{
    if (text === undefined || maxWidth <= 0 || lineHeight <= 0)
    {
        return;
    }

    if (!Bitmap.kmsNonAntiAliasFontCanvas)
    {
        createFontCanvas();
    }

    var lineOffset = calcLineOffset(lineHeight, this.fontSize);
    y          += lineOffset.y;
    lineHeight += lineOffset.height;

    var fontCanvas = Bitmap.kmsNonAntiAliasFontCanvas;
    maxWidth = maxWidth || fontCanvas.width;

    var config = this._createNaTextConfig(maxWidth, lineHeight);

    var context = this._context;
    var alpha = context.globalAlpha;
    context.save();
    drawTextAreaForDebug(context, x, y, maxWidth, lineHeight);

    // フォント用キャンバスに基準サイズで描画
    var fontContext = this._setupNaFontContext(config);
    var metrics = fontContext.measureText(text);
    if (metrics.width <= 0)
    {
        cleanupNaaFontContext.call(this);
        return;
    }

    this._context = fontContext;
    this._drawTextOutline(text, config.tx, config.ty, config.baseMaxWidth);
    fontContext.globalAlpha = alpha;
    this._drawTextBody(text, config.tx, config.ty + config.bufferLineOffset, config.baseMaxWidth);
    this._context = context;

    transferTempToDest(context, fontCanvas, x, y, maxWidth, lineHeight, config, metrics, align);

    cleanupNaaFontContext.call(this, true);
};

Bitmap.setDefaultDrawTextNaMethod(Params.defaultMethod);
Bitmap.updateForceNonAa(Params.enableForceNonAa);


//-----------------------------------------------------------------------------
// DataManager

if (Params.associatedSwitchId > 0)
{
    var _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function()
    {
        _DataManager_createGameObjects.call(this);

        // アンチエイリアス除去スイッチの初期値は ON にする
        $gameSwitches.setValue(Params.associatedSwitchId, true);
    };
}


//-----------------------------------------------------------------------------
// Game_Switches

if (Params.associatedSwitchId > 0)
{
    var _Game_Switches_onChange = Game_Switches.prototype.onChange;
    Game_Switches.prototype.onChange = function()
    {
        _Game_Switches_onChange.call(this);

        Bitmap.updateForceNonAa(this.value(Params.associatedSwitchId));
    };
}

})();
