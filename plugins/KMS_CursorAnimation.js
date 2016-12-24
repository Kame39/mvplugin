//=============================================================================
// KMS_CursorAnimation.js
//  last update: 2016/12/24
//=============================================================================

/*:
 * @plugindesc
 * [v0.3.0] Display an animation on the location of the cursor.
 * 
 * @author TOMY (Kamesoft)
 *
 * @param Radius X
 * @default 16
 * @desc The X radius of the animation. [pixel]
 *
 * @param Radius Y
 * @default 16
 * @desc The Y radius of the animation. [pixel]
 *
 * @param Animation speed
 * @default 1.5
 * @desc Animation speed.
 *
 * @help This plugin does not provide plugin commands.
 */

/*:ja
 * @plugindesc
 * [v0.3.0] カーソルの位置にアニメーションを表示します。
 * 
 * @author TOMY (Kamesoft)
 *
 * @param Radius X
 * @default 16
 * @desc アニメーションの X 方向半径をピクセル単位で指定します。
 *
 * @param Radius Y
 * @default 16
 * @desc アニメーションの Y 方向半径をピクセル単位で指定します。
 *
 * @param Animation speed
 * @default 1.5
 * @desc アニメーションの速度です。
 *
 * @help このプラグインには、プラグインコマンドはありません。
 */

var KMS = KMS || {};

(function()
{

'use strict';

KMS.imported = KMS.imported || {};
KMS.imported['CursorAnimation'] = true;

var PixiVersion = PIXI.mesh ? 4 : 2;

var pluginParams = PluginManager.parameters('KMS_CursorAnimation');
var Params = {};
Params.radiusX = Number(pluginParams['Radius X'] || 16);
Params.radiusY = Number(pluginParams['Radius Y'] || 16);
Params.animationSpeed = Number(pluginParams['Animation speed'] || 1.5);


//-----------------------------------------------------------------------------
// Window

Window.prototype.isCursorActive = function()
{
    return this.visible &&
        this.active &&
        this.isOpen() &&
        this._cursorRect.width > 0 &&
        this._cursorRect.height > 0;
};

Window.prototype.getRelativeCursorPosition = function()
{
    var pad = this._padding;
    var x = this.x + this._cursorRect.x + pad - this.origin.x;
    var y = this.y + this._cursorRect.y + pad - this.origin.y + this._cursorRect.height / 2;

    return new Point(x, y);
};

//-----------------------------------------------------------------------------
// Sprite_AnimationCursorParticle
//
// カーソル位置に表示するアニメーションのパーティクル的なスプライトです。

function Sprite_AnimationCursorParticle()
{
    this.initialize.apply(this, arguments);
}

Sprite_AnimationCursorParticle.prototype = Object.create(Sprite_Base.prototype);
Sprite_AnimationCursorParticle.prototype.constructor = Sprite_AnimationCursorParticle;

Sprite_AnimationCursorParticle.prototype.MIN_SPEED = 2;

Sprite_AnimationCursorParticle.prototype.initialize = function()
{
    Sprite_Base.prototype.initialize.call(this);
    this._delta = 0;
    this._color = 'green';
    this.setupBitmap();
    this.setDestination(new Point(0, 0), 0);
    this.x = Graphics.width / 2;
    this.y = Graphics.height / 2;
    this.z = 100;
    this.visible = true;
    this.opacity = 0;
};

Sprite_AnimationCursorParticle.prototype.setupBitmap = function()
{
    this.bitmap = new Bitmap(1, 1);  // dummy

    this._lineBitmap = new Bitmap(64, 3);
    this.redrawLine();

    var ropeCount = 8;
    this._ropePoints = []
    for (var i = 0; i < ropeCount; ++i)
    {
        this._ropePoints.push(new PIXI.Point(i * 8, 0));
    }

    if (PixiVersion == 2)
    {
        this._rope = new PIXI.Rope(this._lineBitmap, this._ropePoints);
        this._rope.blendMode = PIXI.blendModes.ADD;
    }
    else
    {
        // For Pixi v4
        this._rope = new PIXI.mesh.Rope(
            new PIXI.Texture.fromCanvas(this._lineBitmap._canvas),
            this._ropePoints);
        this._rope.blendMode = PIXI.BLEND_MODES.ADD;
    }

    this.addChild(this._rope);
};

Sprite_AnimationCursorParticle.prototype.redrawLine = function()
{
    this._lineBitmap.gradientFillRect(0, 0, this._lineBitmap.width, this._lineBitmap.height, 'black', this._color);
};

Sprite_AnimationCursorParticle.prototype.setDestination = function(point, opacity)
{
    this._destinationPoint = point;
    this._destinationOpacity = opacity;
};

Sprite_AnimationCursorParticle.prototype.update = function()
{
    Sprite_Base.prototype.update.call(this);
    this.updatePosition();
};

Sprite_AnimationCursorParticle.prototype.updatePosition = function()
{
    this.updateRope();

    if (this.x == this._destinationPoint.x &&
        this.y == this._destinationPoint.y &&
        this.opacity == this._destinationOpacity)
    {
        return;
    }

    this.x = this.forwardValue(this.x, this._destinationPoint.x);
    this.y = this.forwardValue(this.y, this._destinationPoint.y);
    this.opacity = this.forwardValue(this.opacity, this._destinationOpacity, 1.5);
};

Sprite_AnimationCursorParticle.prototype.forwardValue = function(fromVal, toVal, coef)
{
    coef = coef || 1;

    var diff = (toVal - fromVal) * coef;
    var absDiff = Math.abs(diff);
    if (absDiff <= this.MIN_SPEED)
    {
        return toVal;
    }

    diff = Math.max(Math.sqrt(absDiff) / 2, this.MIN_SPEED);

    if (toVal < fromVal)
    {
        diff = -diff;
    }

    return fromVal + diff;
};

Sprite_AnimationCursorParticle.prototype.updateRope = function()
{
    var dx = this._destinationPoint.x - this.x;
    var dy = this._destinationPoint.y - this.y;
    var radDelta = this._delta * Math.PI;
    var count = this._ropePoints.length;
    for (var i = 0; i < count; ++i)
    {
        var omega = i * 0.1 + Graphics.frameCount / 60 * Params.animationSpeed;
        this._ropePoints[i].x =
            Params.radiusX * Math.sin(omega * 3 + radDelta) + dx * i / count;
        this._ropePoints[i].y =
            Params.radiusY * Math.sin(omega * 4 + radDelta) + dy * i / count;
    }
};

/**
 * アニメーションの時間差
 *
 * @property delta
 * @type     Number
 */
Object.defineProperty(Sprite_AnimationCursorParticle.prototype, 'delta', {
    get: function()
    {
        return this._delta;
    },
    set: function(value)
    {
        this._delta = value;
    },
    configurable: true
});

/**
 * ラインの描画色
 *
 * @property color
 * @type     CSS color code
 */
Object.defineProperty(Sprite_AnimationCursorParticle.prototype, 'color', {
    get: function()
    {
        return this._color;
    },
    set: function(value)
    {
        this._color = value;
        this.redrawLine();
    },
    configurable: true
});

//-----------------------------------------------------------------------------
// Sprite_AnimationCursor
//
// カーソル位置に表示するアニメーションスプライトです。


function Sprite_AnimationCursor()
{
    this.initialize.apply(this, arguments);
}

Sprite_AnimationCursor.prototype = Object.create(Sprite_Base.prototype);
Sprite_AnimationCursor.prototype.constructor = Sprite_AnimationCursor;

Sprite_AnimationCursor.prototype.initialize = function()
{
    Sprite_Base.prototype.initialize.call(this);
    this.x = 0;
    this.y = 0;
    this.z = 100;
    this.visible = true;
    this._frameCount = 0;
    this._windowLayers = [];
    this._activeWindow = null;
    this.resetPosition();
    this.createParticles();
};

Sprite_AnimationCursor.prototype.createParticles = function()
{
    var colors = ['red', 'orange', 'green', 'cyan', 'violet'];
    for (var i = 0; i < colors.length; ++i)
    {
        var particle = new Sprite_AnimationCursorParticle();
        particle.delta = i * 2.0 / colors.length;
        particle.color = colors[i];
        this.addChild(particle);
    }
};

Sprite_AnimationCursor.prototype.resetPosition = function()
{
    this._focus = new Point(Graphics.width / 2, Graphics.height / 2);
    this._targetOpacity = 0;
    this.notifyParticle();
};

Sprite_AnimationCursor.prototype.notifyParticle = function()
{
    this.children.forEach(function(child)
    {
        child.setDestination(this._focus, this._targetOpacity);
    }, this);
};

Sprite_AnimationCursor.prototype.update = function()
{
    Sprite_Base.prototype.update.call(this);
    this.updatePosition();
    this.children.forEach(function(child)
    {
        child.update();
    }, this);
};

Sprite_AnimationCursor.prototype.updatePosition = function()
{
    this.updateActiveWindow();
};

Sprite_AnimationCursor.prototype.updateActiveWindow = function()
{
    if (!this.isActiveWindow(this._activeWindow))
    {
        this._activeWindow = this.findActiveWindow();
    }

    // 移動先の座標を設定
    if (this._activeWindow)
    {
        var pos = this._activeWindow.getRelativeCursorPosition();
        var layer = this.getParentWindowLayer(this._activeWindow);
        if (layer)
        {
            pos.x += layer.x;
            pos.y += layer.y;
        }
        this._focus = pos;
        this._targetOpacity = 255;
    }
    else
    {
        this._targetOpacity = 0;
    }
    this.notifyParticle();
};

Sprite_AnimationCursor.prototype.isActiveWindow = function(window)
{
    return window && window.isCursorActive();
};

Sprite_AnimationCursor.prototype.getParentWindowLayer = function(window)
{
    if (!window)
    {
        return null;
    }

    for (var i = 0; i < this._windowLayers.length; i++)
    {
        var layer = this._windowLayers[i];
        if (window.parent === layer)
        {
            return layer;
        }
    }

    return null;
};

Sprite_AnimationCursor.prototype.findActiveWindow = function()
{
    var window = null;
    for (var i = 0; i < this._windowLayers.length && window == null; i++)
    {
        this._windowLayers[i].children.some(function(child)
        {
            if (child instanceof Window && child.isCursorActive())
            {
                window = child;
                return true;
            }
            else
            {
                return false;
            }
        });
    }

    return window;
};

Sprite_AnimationCursor.prototype.addWindowLayer = function(layer)
{
    if (layer && !this._windowLayers.contains(layer))
    {
        this._windowLayers.push(layer);
    }
};


//-----------------------------------------------------------------------------
// Scene_Base

Scene_Base.prototype.createAnimationCursor = function()
{
    this._animationCursor = new Sprite_AnimationCursor();
};

Scene_Base.prototype.startAnimationCursor = function()
{
    this._animationCursor.addWindowLayer(this._windowLayer);
    this.addChild(this._animationCursor);
};

Scene_Base.prototype.updateAnimationCursor = function()
{
    this._animationCursor.update();
};

var _KMS_CursorAnimation_Scene_Base_create = Scene_Base.prototype.create;
Scene_Base.prototype.create = function()
{
    _KMS_CursorAnimation_Scene_Base_create.call(this);
    this.createAnimationCursor();
};

var _KMS_CursorAnimation_Scene_Base_start = Scene_Base.prototype.start;
Scene_Base.prototype.start = function()
{
    _KMS_CursorAnimation_Scene_Base_start.call(this);
    this.startAnimationCursor();
};

var _KMS_CursorAnimation_Scene_Base_update = Scene_Base.prototype.update;
Scene_Base.prototype.update = function()
{
    _KMS_CursorAnimation_Scene_Base_update.call(this);
    this.updateAnimationCursor();
};

})();
