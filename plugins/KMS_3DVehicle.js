//=============================================================================
// KMS_3DVehicle.js
//   Last update : 2017/01/21
//=============================================================================

/*
 * This plugin is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * This plugin requires "three.js".
 * http://threejs.org/
 *
 * This plugin can be used in the environment which supports WebGL.
 */

/*:
 * @plugindesc
 * [v0.2.1α] Display 3D map when getting on the airplane.
 * 
 * @author TOMY (Kamesoft)
 *
 * @param 3D mode switch
 * @default 0
 * @desc 3D モード時に ON にするスイッチの番号です。0 にするとスイッチ操作をしなくなります。
 *
 * @param Plane speed
 * @default 6
 * @desc Move speed of the airplane.
 *
 * @param Plane whirl speed
 * @default 0.0349
 * @desc Whirl speed of the airplane. Specified by the rad unit per frame.
 *
 * @param Plane tilt angle
 * @default 0.314
 * @desc The tilt angle of the whirling airplane.
 *
 * @param Accel touch area
 * @default 0.7
 * @desc The touch area judged to be go forward. 1.0 indicates the whole screen.
 *
 * @param Whirl touch area
 * @default 0.7
 * @desc The touch area judged to be whirl. 1.0 indicates harl of screen left and right.
 *
 * @param Map quality
 * @default 0.5
 * @desc Map quality in 3D mode. Processing load also becomes so heavy that it is increased.
 *
 * @param Use CDN
 * @default 0
 * @desc 
 * Specify the source of "three.min.js" to load from CDN or local.
 * 0: From local (js/libs/three.min.js), 1: From CDN
 *
 * @help This plugin does not provide plugin commands.
 */

/*:ja
 * @plugindesc
 * [v0.2.1α] 飛空艇搭乗時のマップを 3D 化します。
 * 
 * @author TOMY (Kamesoft)
 *
 * @param 3D mode switch
 * @default 0
 * @desc 3D モード時に ON にするスイッチの番号です。0 にするとスイッチ操作をしなくなります。
 *
 * @param Plane speed
 * @default 6
 * @desc 飛空艇の移動速度です。
 *
 * @param Plane whirl speed
 * @default 0.0349
 * @desc 飛空艇の旋回速度です。1 フレームあたりの回転角度をラジアン単位で指定します。
 *
 * @param Plane tilt angle
 * @default 0.314
 * @desc 飛空艇旋回時の画面の傾き具合です。
 *
 * @param Accel touch area
 * @default 0.7
 * @desc タッチ操作を前進と判定する範囲です。画面中央からの割合で指定し、1.0 で画面全体になります。
 *
 * @param Whirl touch area
 * @default 0.7
 * @desc タッチ操作を旋回と判定する範囲です。画面左右からの割合で指定し、1.0 で画面半分ずつになります。
 *
 * @param Map quality
 * @default 0.5
 * @desc 3D モード時のマップ画質です。値を大きくするほど高画質になりますが、処理負荷も増大します。
 *
 * @param Use CDN
 * @default 0
 * @desc 
 * どの "three.min.js" を使用するか指定します。
 * 0: ローカル (js/libs/three.min.js), 1: CDN
 *
 * @help このプラグインには、プラグインコマンドはありません。
 */

var KMS = KMS || {};

(function(undefined)
{

if (!Graphics.hasWebGL())
{
    console.error("WebGL をサポートしていないため、three.js を使用できません。");
    return;
}

KMS.imported = KMS.imported || {};
KMS.imported['3DVehicle'] = true;

var PixiVersion = PIXI.TwistFilter ? 2 : 4;

var PluginName = 'KMS_3DVehicle';

var pluginParams = PluginManager.parameters(PluginName);
var Params = {};
Params.in3DModeSwitchId = Number(pluginParams['3D mode switch'] || 0);
Params.speed = {
    plane: Number(pluginParams['Plane speed'] || 6),
    planeWhirl: Number(pluginParams['Plane whirl speed'] || (Math.PI / 90))
};
Params.whirlTiltAngle = Number(pluginParams['Plane tilt angle'] || (Math.PI / 12));
Params.touchArea = {
    accel: Number(pluginParams['Accel touch area'] || 0.7),
    whirl: Number(pluginParams['Whirl touch area'] || 0.7)
};
Params.mapQuality = Number(pluginParams['Map quality'] || 0.5);
Params.useCdn = Number(pluginParams['Use CDN'] || 0);

//Params._debugMode = true;

// three.js のロード
(function()
{
    var threeJsId = 'three-js-script';
    if (document.getElementById(threeJsId) || typeof THREE !== 'undefined')
    {
        return;
    }

    var url = Params.useCdn ?
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r73/three.min.js' :
        'js/libs/three.min.js';

    console.info('[' + PluginName + '] Load "three.min.js" from ' + (Params.useCdn ? 'CDN' : 'local'));

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url
    script.async = false;
    script.onerror = PluginManager.onError.bind(PluginManager);
    script._url = url;
    script.id = threeJsId;
    document.body.appendChild(script);
})();


//-----------------------------------------------------------------------------
// Tilemap

var _KMS_3DVehicle_Tilemap_createLayers = Tilemap.prototype._createLayers;
Tilemap.prototype._createLayers = function()
{
    // レイヤーが重複して追加される不具合への対処
    if (this._lowerLayer)
    {
        this.removeChild(this._lowerLayer);
        this._lowerLayer = null;
    }
    if (this._upperLayer)
    {
        this.removeChild(this._upperLayer);
        this._upperLayer = null;
    }

    _KMS_3DVehicle_Tilemap_createLayers.call(this);
};


//-----------------------------------------------------------------------------
// Game_Temp

var _KMS_3DVehicle_Game_Temp_initialize = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function()
{
    _KMS_3DVehicle_Game_Temp_initialize.call(this);

    this._gameScene3DObjects = {};
    this._gameMap3DObjects = {};
};

Object.defineProperties(Game_Temp.prototype, {
    // Game_Scene 用の 3D オブジェクト
    gameScene3DObjects: {
        get: function() { return this._gameScene3DObjects; },
        set: function(value) { this._gameScene3DObjects = value; },
        configurable: true
    },

    // Game_Map 用の 3D オブジェクト
    gameMap3DObjects: {
        get: function() { return this._gameMap3DObjects; },
        set: function(value) { this._gameMap3DObjects = value; },
        configurable: true
    }
});


//-----------------------------------------------------------------------------
// Game_Screen

var _KMS_3DVehicle_Game_Screen_initialize = Game_Screen.prototype.initialize;
Game_Screen.prototype.initialize = function()
{
    _KMS_3DVehicle_Game_Screen_initialize.call(this);
    this._change3DModeDuration = 0;
    this._isNext3DMode = false;
};

/**
 * 3D モードへ移行
 */
Game_Screen.prototype.change3DMode = function(enable, caller, callback)
{
    var fadeSpeed = Game_Interpreter.prototype.fadeSpeed.call(null);

    var obj3d = $gameTemp.gameScene3DObjects;
    obj3d.change3DCaller = caller;
    obj3d.change3DCallback = callback;

    this._change3DModeDuration = fadeSpeed * 2 + (enable ? 20 : 0);
    this._isNext3DMode = !!enable;
};

/**
 * 3D モードへ移行中
 */
Game_Screen.prototype.isChanging3DMode = function()
{
    return this._change3DModeDuration > 0;
};

var _KMS_3DVehicle_Game_Screen_update = Game_Screen.prototype.update;
Game_Screen.prototype.update = function()
{
    _KMS_3DVehicle_Game_Screen_update.call(this);
    this.updateChange3D();
};

/**
 * 3D モード遷移処理の更新
 */
Game_Screen.prototype.updateChange3D = function()
{
    if (this._change3DModeDuration <= 0)
    {
        return;
    }

    var fadeSpeed = Game_Interpreter.prototype.fadeSpeed.call(null);
    switch (this._change3DModeDuration)
    {
        case fadeSpeed * 2:
            this.startFadeOut(fadeSpeed);
            break;
        case fadeSpeed:
            {
                $gameSwitches.setValue(
                    Params.in3DModeSwitchId,
                    this._isNext3DMode);

                var obj3d = $gameTemp.gameScene3DObjects;
                obj3d.change3DCallback.call(
                    obj3d.change3DCaller,
                    this._isNext3DMode);
                this.startFadeIn(fadeSpeed);
            }
            break;
    };
    this._change3DModeDuration--;
};


//-----------------------------------------------------------------------------
// Game_Map

var _KMS_3DVehicle_Game_Map_initialize = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function()
{
    _KMS_3DVehicle_Game_Map_initialize.call(this);
    this._3DMode = false;

    var obj3d = $gameTemp.gameMap3DObjects;
    obj3d.mapObject = null;
    obj3d.setModeCaller = null;
    obj3d.setModeCallback = null;
};

Game_Map.prototype.set3DMode = function(value)
{
    this._3DMode = !!value;

    var obj3d = $gameTemp.gameMap3DObjects;
    if (obj3d.setModeCaller && obj3d.setModeCallback)
    {
        obj3d.setModeCallback.call(obj3d.setModeCaller, this.is3DMode());
    }
};

Game_Map.prototype.is3DMode = function()
{
    return this._3DMode;
};

Game_Map.prototype.is3DReady = function()
{
    return this.is3DMode();
};

Game_Map.prototype.create3DMap = function()
{
    var obj3d = $gameTemp.gameMap3DObjects;
    if (obj3d.mapObject)
    {
        this.dispose3DMap();
    }
    obj3d.mapObject = new Game_3DMap();
};

Game_Map.prototype.dispose3DMap = function()
{
    var obj3d = $gameTemp.gameMap3DObjects;
    obj3d.mapObject.dispose();
    obj3d.mapObject = null;
};

Game_Map.prototype.get3DMap = function()
{
    return $gameTemp.gameMap3DObjects.mapObject;
};

Game_Map.prototype.set3DModeCallback = function(caller, callback)
{
    var obj3d = $gameTemp.gameMap3DObjects;
    obj3d.setModeCaller = caller;
    obj3d.setModeCallback = callback;
};

Game_Map.prototype.get3DPlayerAngle = function()
{
    return this.get3DMap().getPlayerAngle();
};

Game_Map.prototype.save3DMapInfo = function()
{
    var obj3d = $gameTemp.gameMap3DObjects;
    obj3d.savedPosition = {};
    obj3d.savedPosition.angle = this.get3DPlayerAngle();
};

Game_Map.prototype.restore3DMapInfo = function()
{
    var map3d = this.get3DMap();
    var obj3d = $gameTemp.gameMap3DObjects;
    if (map3d && obj3d.savedPosition)
    {
        map3d.setPlayerAngle(obj3d.savedPosition.angle);
        obj3d.savedPosition = null;
    }
};


//-----------------------------------------------------------------------------
// Game_CharacterBase

/**
 * スクロールを無視した画面 X 座標
 */
Game_CharacterBase.prototype.notScrolledScreenX = function()
{
    var tw = $gameMap.tileWidth();
    return Math.round(this._realX * tw + tw / 2);
};

/**
 * スクロールを無視した画面 Y 座標
 */
Game_CharacterBase.prototype.notScrolledScreenY = function()
{
    var th = $gameMap.tileHeight();
    return Math.round(this._realY * th + th - this.shiftY() - this.jumpHeight());
};


//-----------------------------------------------------------------------------
// Game_Player

var _KMS_3DVehicle_Game_Player_isMoving = Game_Player.prototype.isMoving;
Game_Player.prototype.isMoving = function()
{
    if ($gameMap.is3DMode())
    {
        // 3D モード中は realX/Y が自動更新されないようにする
        return false;
    }

    return _KMS_3DVehicle_Game_Player_isMoving.call(this);
};

var _KMS_3DVehicle_Game_Player_moveByInput = Game_Player.prototype.moveByInput;
Game_Player.prototype.moveByInput = function()
{
    if ($gameMap.is3DMode())
    {
        $gameMap.get3DMap().updateMove();
    }
    else
    {
        _KMS_3DVehicle_Game_Player_moveByInput.call(this);
    }
};

var _KMS_3DVehicle_Game_Player_update = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive)
{
    _KMS_3DVehicle_Game_Player_update.call(this, sceneActive);

    if ($gameMap.is3DMode() && this.canMove())
    {
        if (!this.triggerButtonActionFor3DVehicle())
        {
            this.triggerTouchActionFor3DVehicle();
        }
    }
};

Game_Player.prototype.triggerButtonActionFor3DVehicle = function()
{
    if (Input.isTriggered('ok'))
    {
        // OK ボタンでは降りない
        if (!this.isInVehicle() && this.getOnVehicle())
        {
            return true;
        }
        this.checkEventTriggerHere([0]);
        if ($gameMap.setupStartingEvent())
        {
            return true;
        }
        this.checkEventTriggerThere([0, 1, 2]);
        if ($gameMap.setupStartingEvent())
        {
            return true;
        }
    }
    else if (Input.isTriggered('cancel'))
    {
        if (this.isInVehicle() && this.getOffVehicle())
        {
            return true;
        }
    }

    return false;
};

Game_Player.prototype.triggerTouchActionFor3DVehicle = function()
{
    if (TouchInput.isTriggered())
    {
        // シングルタッチでは降りない
        if (!this.isInVehicle() && this.getOnVehicle())
        {
            return true;
        }

        // TODO: イベント起動ができるならやる
    }
    else if (TouchInput.isCancelled())
    {
        if (this.isInVehicle() && this.getOffVehicle())
        {
            return true;
        }
    }

    return false;
};

var _KMS_3DVehicle_Game_Player_triggerButtonAction = Game_Player.prototype.triggerButtonAction;
Game_Player.prototype.triggerButtonAction = function()
{
    if (!$gameMap.is3DMode())
    {
        return _KMS_3DVehicle_Game_Player_triggerButtonAction.call(this);
    }

    return false;
};

var _KMS_3DVehicle_Game_Player_triggerTouchAction = Game_Player.prototype.triggerTouchAction;
Game_Player.prototype.triggerTouchAction = function()
{
    if (!$gameMap.is3DMode())
    {
        return _KMS_3DVehicle_Game_Player_triggerTouchAction.call(this);
    }

    return false;
};


//-----------------------------------------------------------------------------
// Game_Vehicle

Game_Vehicle.prototype.getOn = function() {
    this._driving = true;
    this.setWalkAnime(true);
    this.setStepAnime(true);
    $gameSystem.saveWalkingBgm();
    this.playBgm();

    if (this.isAirship())
    {
        $gameScreen.change3DMode(true, this, this.set3DMode);
    }
};

Game_Vehicle.prototype.getOff = function() {
    this._driving = false;
    this.setWalkAnime(false);
    this.setStepAnime(false);
    this.resetDirection();
    $gameSystem.replayWalkingBgm();

    if (this.isAirship())
    {
        $gameScreen.change3DMode(false, this, this.set3DMode);
    }
};

Game_Vehicle.prototype.set3DMode = function(enabled)
{
    $gameMap.set3DMode(enabled);
};

var _KMS_3DVehicle_Game_Vehicle_direction = Game_Vehicle.prototype.direction;
Game_Vehicle.prototype.direction = function()
{
    if ($gameMap.is3DMode())
    {
        return 8;
    }
    else
    {
        return _KMS_3DVehicle_Game_Vehicle_direction.call(this);
    }
};

var _KMS_3DVehicle_Game_Vehicle_screenX = Game_Vehicle.prototype.screenX;
Game_Vehicle.prototype.screenX = function()
{
    if ($gameMap.is3DMode())
    {
        return Graphics.width / 2;
    }
    else
    {
        return _KMS_3DVehicle_Game_Vehicle_screenX.call(this);
    }
};

var _KMS_3DVehicle_Game_Vehicle_screenY = Game_Vehicle.prototype.screenY;
Game_Vehicle.prototype.screenY = function()
{
    if ($gameMap.is3DMode())
    {
        return Graphics.height / 2 - this._altitude;
    }
    else
    {
        var baseY = _KMS_3DVehicle_Game_Vehicle_screenY.call(this);
        return baseY - this._altitude * Math.sqrt(this._altitude / 2);
    }
};

var _KMS_3DVehicle_Game_Vehicle_shadowY = Game_Vehicle.prototype.shadowY;
Game_Vehicle.prototype.shadowY = function()
{
    if ($gameMap.is3DMode())
    {
        return 0;
    }
    else
    {
        var baseY = _KMS_3DVehicle_Game_Vehicle_screenY.call(this);
        return baseY + this._altitude;
    }
};

Game_Vehicle.prototype.canMove = function()
{
    if (this.isAirship())
    {
        return this.isHighest() && $gameMap.is3DReady() && !$gameScreen.isChanging3DMode();
    }
    else
    {
        return true;
    }
};

var _KMS_3DVehicle_Game_Vehicle_isTransparent = Game_Vehicle.prototype.isTransparent;
Game_Vehicle.prototype.isTransparent = function()
{
    var isTransparent = _KMS_3DVehicle_Game_Vehicle_isTransparent.call(this);

    if (!isTransparent && $gameMap.is3DMode())
    {
        isTransparent = this._type !== $gamePlayer._vehicleType;
    }

    return isTransparent;
};


//-----------------------------------------------------------------------------
// Game_3DMap

Game_3DMap = function()
{
    this.initialize.apply(this, arguments);
};

Game_3DMap.prototype = Object.create(Sprite.prototype);
Game_3DMap.prototype.constructor = Game_3DMap;

//! 最大回転角
Game_3DMap.prototype.MaxRot = {
    x: Math.PI / 12,
    y: 0,
    z: Params.whirlTiltAngle
};

//! 1 フレームあたりの回転角の変化量
Game_3DMap.prototype.StepRot = {
    x: Game_3DMap.prototype.MaxRot.x / 8,
    y: Params.speed.planeWhirl,
    z: Game_3DMap.prototype.MaxRot.z / 16
};

//! 座標の変化量
Game_3DMap.prototype.StepPos = { y: 4 };

//! 座標の最大値
Game_3DMap.prototype.MaxPos = { y: 192 };

//! 座標の最小値
Game_3DMap.prototype.MinPos = { y: 96 };

/**
 * オブジェクトの初期化
 */
Game_3DMap.prototype.initialize = function()
{
    Sprite.prototype.initialize.call(this);

    this.create3dScene();
    this.createPlayerMesh();
    this.createShadowMesh();
    this.createCamera();
    this.create3dRenderer();

    this._stage2d = new Stage();

    this._moveSpeed = 0;
    this._parallaxX = 0;
};

/**
 * 3D シーンの作成
 */
Game_3DMap.prototype.create3dScene = function()
{
    this._scene3d = new THREE.Scene();
    this._scene3d.fog = new THREE.Fog("white", 200, 2000);
};

/**
 * プレイヤーを作成
 */
Game_3DMap.prototype.createPlayerMesh = function()
{
    var material = new THREE.MeshBasicMaterial({ color: 0 });
    material.transparent = true;
    material.opacity = 0.5;

    // 形は何でも良いので三角形
    var shape = new THREE.Shape();
    shape.moveTo(0, 4);
    shape.lineTo(4, -2);
    shape.lineTo(-4, -2);
    shape.lineTo(0, 4);

    var geometry = new THREE.ShapeGeometry(shape);
    var player= new THREE.Mesh(geometry, material);
    player.position.y = 96;
    player.visible = false;


    this._player = player;
    this._scene3d.add(this._player);
};

/**
 * 影を作成
 */
Game_3DMap.prototype.createShadowMesh = function()
{
    var shadow = new THREE.Mesh(
        new THREE.CircleGeometry(10, 16),
        new THREE.MeshBasicMaterial({ color: 0x101010, transparent: true, opacity: 0.35 }));
    shadow.position.y = 10;
    shadow.rotation.x = -Math.PI / 2;
    shadow.transparent = true;
    shadow.renderOrder = 1;

    this._shadow = shadow;
    this._scene3d.add(this._shadow);
};

/**
 * カメラを作成
 */
Game_3DMap.prototype.createCamera = function()
{
    this._camera = new THREE.PerspectiveCamera(75, Graphics.width / Graphics.height, 1, 2000);
    this._camera.position.set(0, this.MinPos.y, 0);
    this._camera.updateProjectionMatrix();
};

/**
 * 3D レンダラの作成
 */
Game_3DMap.prototype.create3dRenderer = function()
{
    this._canvas3d = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this._canvas3d.setSize(Graphics.width, Graphics.height);
    this._canvas3d.setClearColor(0, 0);

    // 3D 描画結果を 2D 上に表示するためのスプライト
    this._texture3d = PIXI.Texture.fromCanvas(this._canvas3d.domElement);
    this._sprite3d = new PIXI.Sprite(this._texture3d);
    this.addChild(this._sprite3d);
};

/**
 * オブジェクトの破棄
 */
Game_3DMap.prototype.dispose = function()
{
    this.clear();

    if (this._player)
    {
        this._player.material.dispose();
        this._player = null;
    }
    this.removeChild(this._sprite3d);
    this._canvas3d.dispose();
    //this._stage2d.destroy();
};

Game_3DMap.prototype.parallaxOx = function()
{
    return this._parallaxX;
};

Game_3DMap.prototype.parallaxOy = function()
{
    return 0;
};

/**
 * 遠景の回転量を取得
 */
Game_3DMap.prototype.parallaxRotation = function()
{
    return this._player.rotation.z;
};

/*
 * 処理時間をコンソールに表示 (デバッグ用)
 */
var consoleTimeBegin;
var consoleTimeEnd;
if (Params._debugMode)
{
    consoleTimeBegin = function(key) { console.time(key); };
    consoleTimeEnd = function(key) { console.timeEnd(key); };
}
else
{
    consoleTimeBegin = function() { };
    consoleTimeEnd = function() { };
}

/**
 * 指定した軸を中心とした回転用のクォータニオンを作成
 */
var calcQuaternion = function(axis, angleRad)
{
    var quat = new THREE.Quaternion();
    quat.setFromAxisAngle(axis.normalize(), angleRad);

    return quat;
};

/**
 * 2のべき乗に切り上げる
 */
var roundUpSquareSize = function(n)
{
    var square = 1;
    while (n > square)
    {
        square *= 2;
    }

    return square;
};

var snapForTileTexture = function(stage, width, height)
{
    var bitmap = new Bitmap(width, height);
    var context = bitmap._context;
    var renderTexture = (PixiVersion === 2) ?
        new PIXI.RenderTexture(width, height) :
        PIXI.RenderTexture.create(width, height);

    if (stage)
    {
        consoleTimeBegin('render@snap');
        if (PixiVersion === 2)
        {
            renderTexture.render(stage);
        }
        else
        {
            Graphics._renderer.render(stage, renderTexture);
        }

        stage.worldTransform.identity();
        consoleTimeEnd('render@snap');
    }

    if (PixiVersion === 2)
    {
        if (Graphics.isWebGL())
        {
            var gl = renderTexture.renderer.gl;
            var webGLPixels = new Uint8Array(4 * width * height);

            consoleTimeBegin('read@snap');
            gl.bindFramebuffer(gl.FRAMEBUFFER, renderTexture.textureBuffer.frameBuffer);
            gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            consoleTimeEnd('read@snap');

            consoleTimeBegin('copy@snap');
            var canvasData = context.getImageData(0, 0, width, height);
            canvasData.data.set(webGLPixels);
            context.putImageData(canvasData, 0, 0);
            consoleTimeEnd('copy@snap');
        }
        else
        {
            context.drawImage(renderTexture.textureBuffer.canvas, 0, 0);
        }
    }
    else
    {
        var canvas = Graphics.isWebGL() ?
            Graphics._renderer.extract.canvas(renderTexture) :
            renderTexture.baseTexture._canvasRenderTarget.canvas;
        context.drawImage(canvas, 0, 0);
    }

    bitmap._setDirty();
    return bitmap;
};

var updateLayerPos = function()
{
    var ox = Math.floor(this.origin.x);
    var oy = Math.floor(this.origin.y);
    var startX = Math.floor((ox - this._margin) / this._tileWidth);
    var startY = Math.floor((oy - this._margin) / this._tileHeight);
    this._updateLayerPositions(startX, startY);

    this._frameUpdated = this._lastAnimationFrame !== this.animationFrame;
    this._lastAnimationFrame = this.animationFrame;
    this._lastStartX = startX;
    this._lastStartY = startY;
    this._paintAllTiles(startX, startY);
    this._needsRepaint = false;
    this._sortChildren();
};

/**
 * タイルマップのキャプチャを実行
 */
Game_3DMap.prototype.captureTilemap = function(originalHolder, tilemap, characters)
{
    this._originalTilemapHolder = originalHolder;
    this._tilemap = tilemap;
    this._characters = characters;
    this._baseScale = Params.mapQuality;

    tilemap.origin.x = tilemap.origin.y = tilemap._margin;

    // マップ画像作成のために、イベントをスクロールを無視した位置に配置
    // (次のスプライト更新で元に戻るので、位置は記憶しなくて良い)
    tilemap.children.forEach(function(child, index)
    {
        if (!(child instanceof Sprite_Character) || !child._character)
        {
            return;
        }

        var character = child._character;
        child.x = character.notScrolledScreenX() - tilemap._margin;
        child.y = character.notScrolledScreenY() - tilemap._margin;
    });

    tilemap.width = tilemap._mapWidth * tilemap.tileWidth;
    tilemap.height = tilemap._mapHeight * tilemap.tileHeight;
    //updateLayerPos.call(tilemap);
    tilemap.scale.x = tilemap.scale.y = this._baseScale;
    tilemap.refresh();

    this._stage2d.addChild(this._tilemap);

    consoleTimeBegin('3D snap');
    var bitmap = snapForTileTexture(
        this._stage2d,
        Math.floor(this._tilemap.width * this._baseScale),
        Math.floor(this._tilemap.height * this._baseScale));
    consoleTimeEnd('3D snap');
    var texSize = roundUpSquareSize(Math.max(bitmap.width, bitmap.height));

    this._texRate = { x: texSize / bitmap.width, y: texSize / bitmap.height };
    var loopNum = 2 * Math.min(2, Math.ceil(
        2500 * Math.max(this._texRate.x, this._texRate.y) * this._baseScale / texSize));

    consoleTimeBegin('3D blt');
    this._tileBitmap = new Bitmap(texSize, texSize);
    this._tileBitmap.blt(bitmap, 0, 0, bitmap.width, bitmap.height, 0, 0, texSize, texSize);
    consoleTimeEnd('3D blt');

    // ループ仕様でテクスチャを作成
    consoleTimeBegin('3D texture');
    this._planeTexture = new THREE.Texture(this._tileBitmap.canvas);
    this._planeTexture.needsUpdate = true;
    this._planeTexture.wrapS = this._planeTexture.wrapT = THREE.RepeatWrapping;
    this._planeTexture.repeat.set(loopNum, loopNum);
    consoleTimeEnd('3D texture');

    consoleTimeBegin('3D material');
    this._planeMaterial = new THREE.MeshBasicMaterial({ map: this._planeTexture });
    this._planeMaterial.transparent = true;
    consoleTimeEnd('3D material');

    consoleTimeBegin('3D geometry');
    this._planeGeometry = new THREE.PlaneGeometry(
        texSize * loopNum / this._texRate.x / this._baseScale,
        texSize * loopNum / this._texRate.y / this._baseScale,
        8, 8);
    consoleTimeEnd('3D geometry');

    // 地面オブジェクト
    consoleTimeBegin('3D mesh');
    this._planeMesh = new THREE.Mesh(this._planeGeometry, this._planeMaterial);
    this._planeMesh.position.set(0, 0, 0);
    this._planeMesh.rotation.x = -Math.PI / 2;
    consoleTimeEnd('3D mesh');

    this._scene3d.add(this._planeMesh);

    this.setPlayerMapPosition($gamePlayer.x, $gamePlayer.y);
};

/**
 * タイルマップのキャプチャを終了
 */
Game_3DMap.prototype.unCaptureTilemap = function()
{
    //tilemap.origin.x = tilemap.origin.y = tilemap._margin;
    this._tilemap.width = Graphics.width + this._tilemap._margin * 2;
    this._tilemap.height = Graphics.height + this._tilemap._margin * 2;
    updateLayerPos.call(this._tilemap);
    this._tilemap.scale.x = this._tilemap.scale.y = 1;
    this._tilemap.refresh();

    this.clear();
};

/**
 * メンバーのクリア
 */
Game_3DMap.prototype.clear = function()
{
    if (this._originalTilemapHolder)
    {
        this._stage2d.removeChild(this._tilemap);
        this._originalTilemapHolder.addChild(this._tilemap);
        this._originalTilemapHolder = null;
        this._tilemap = null;
    }

    this._scene3d.remove(this._planeMesh);
    this._planeMesh = null;

    if (this._planeGeo)
    {
        this._planeGeo.dispose();
        this._planeGeo = null;
    }

    if (this._planeMaterial)
    {
        this._planeMaterial.dispose();
        this._planeMaterial = null;
    }

    if (this._planeTexture)
    {
        this._planeTexture.dispose();
        this._planeTexture = null;
    }

    this._player.position.y = this.MinPos.y;
    this._player.rotation.set(0, 0, 0);
};

/**
 * 3D レンダリング実行
 */
Game_3DMap.prototype.render3d = function()
{
    if (PixiVersion === 2)
    {
        this._texture3d.baseTexture.dirty();
    }
    else
    {
        // For Pixi v4
        this._texture3d.update();
    }

    this._canvas3d.render(this._scene3d, this._camera);
};

/**
 * プレイヤーのマップ座標を設定
 */
Game_3DMap.prototype.setPlayerMapPosition = function(x, y)
{
    var nx = x * this._tilemap.tileWidth;
    var nz = y * this._tilemap.tileHeight;

    this._player.position.x = nx;
    this._player.position.z = nz;
    this._parallaxX = 0;
    this.updateCamera();
    this.updateShadow();
    this.updateParallax();
};

/**
 * プレイヤーのマップ座標を取得
 */
Game_3DMap.prototype.getPlayerMapPosition = function()
{
    if (this._tilemap)
    {
        var x = this._player.position.x / this._tilemap.tileWidth;
        var y = this._player.position.z / this._tilemap.tileHeight;
        //x -= Math.sin(this._player.rotation.y) * 3;
        //y -= Math.cos(this._player.rotation.y) * 3;
        return { x: x, y: y };
    }
    else
    {
        return { x: 0, y: 0 };
    }
};

Game_3DMap.prototype.setPlayerAngle = function(angle)
{
    this._player.rotation.y = angle;
};

Game_3DMap.prototype.getPlayerAngle = function()
{
    return this._player.rotation.y;
};

/**
 * 実際のプレイヤー位置を 3D マップ上の位置に合わせる
 */
Game_3DMap.prototype.updatePlayerPosition = function()
{
    var pos = this.getPlayerMapPosition();
    $gamePlayer._x = Math.round(pos.x);
    $gamePlayer._y = Math.round(pos.y);
    $gamePlayer._realX = pos.x;
    $gamePlayer._realY = pos.y;
};

/**
 * プレイヤー位置をマップ座標内に収める
 */
Game_3DMap.prototype.roundPlayerPosition = function()
{
    if (!this._tilemap)
    {
        return;
    }

    var pos = this.getPlayerMapPosition();
    if (pos.x >= $gameMap.width())
    {
        this._player.position.x -= this._tilemap.tileWidth * $gameMap.width();
    }
    else if (pos.x < 0)
    {
        this._player.position.x += this._tilemap.tileWidth * $gameMap.width();
    }

    if (pos.y >= $gameMap.height())
    {
        this._player.position.z -= this._tilemap.tileHeight * $gameMap.height();
    }
    else if (pos.y < 0)
    {
        this._player.position.z += this._tilemap.tileHeight * $gameMap.height();
    }
};

/**
 * カメラ座標とアングルの更新
 */
Game_3DMap.prototype.updateCamera = function()
{
    var camera = this._camera;
    var destObj = this._player;

    var dist = (destObj.position.y - this.MinPos.y) * 1.45 + 128;
    var dx = Math.sin(destObj.rotation.y) * dist;
    var dz = Math.cos(destObj.rotation.y) * dist;

    camera.position.x = destObj.position.x + dx;
    camera.position.z = destObj.position.z + dz;
    //camera.position.y = 24 + maxPosY - (maxPosY - destObj.position.y) * 0.25;
    camera.position.y = destObj.position.y;
    camera.lookAt(destObj.position);

    // 旋回時の傾きを反映
    var quat = calcQuaternion(new THREE.Vector3(0, 0, 1), destObj.rotation.z);
    camera.quaternion.multiply(quat);
};

/**
 * 影の更新
 */
Game_3DMap.prototype.updateShadow = function()
{
    this._shadow.position.x = this._player.position.x;
    this._shadow.position.z = this._player.position.z;
};

/**
 * 遠景の更新
 */
Game_3DMap.prototype.updateParallax = function(prevRotY)
{
    if (!$gameMap._parallaxLoopX)
    {
        return;
    }

    if (prevRotY)
    {
        this._parallaxX += (prevRotY - this._player.rotation.y)
            * this._tilemap.tileWidth * $gameMap.width() / Math.PI / 2;
    }
};

/**
 * プレイヤーの移動処理
 */
Game_3DMap.prototype.updateMove = function()
{
    if (!$gamePlayer.canMove())
    {
        return;
    }

    var isFast = this.isInputFast();
    var prevRotY = this._player.rotation.y;

    this.updateAccel(isFast);
    this.updateWhirl(isFast);
    this.updatePitch();
    this.updateCamera();
    this.updateShadow();
    this.updateParallax(prevRotY);

    /*
    if (Input.isTriggered('pageup'))
    {
        console.log(this._camera.position);
        console.log(this.getPlayerMapPosition());
        console.log({ x: $gamePlayer._x, y: $gamePlayer._y });
    }
    */
};

/**
 * 前後への移動処理
 */
Game_3DMap.prototype.updateAccel = function(isFast)
{
    var MaxSpeed = {
        forward: Params.speed.plane,
        backward: Params.speed.plane * 2 / 3
    };
    var StepSpeed = {
        forward: MaxSpeed.forward / 15,
        backward: MaxSpeed.backward / 15,
    };
    var BreakSpeed = $gamePlayer.moveSpeed() / 10;

    if (this.isInputForward())
    {
        // 前進
        this._moveSpeed = Math.max(
            this._moveSpeed - StepSpeed.forward,
            -MaxSpeed.forward);
    }
    else if (this.isInputBackward())
    {
        // 後退
        this._moveSpeed = Math.min(
            this._moveSpeed + StepSpeed.backward,
            MaxSpeed.backward);
    }
    else
    {
        // 操作終了後の慣性移動
        if (this._moveSpeed > 0)
        {
            this._moveSpeed = Math.max(this._moveSpeed - BreakSpeed, 0);
        }
        else
        {
            this._moveSpeed = Math.min(this._moveSpeed + BreakSpeed, 0);
        }
    }

    // 高速移動
    if (this._moveSpeed !== 0)
    {
        this._player.translateZ(this._moveSpeed * (isFast ? 2 : 1));
    }

    this.roundPlayerPosition();
    this.updatePlayerPosition();
};

/**
 * 旋回処理
 */
Game_3DMap.prototype.updateWhirl = function(isFast)
{
    if (this.isInputWhirlLeft())
    {
        this._player.rotation.y += this.StepRot.y * (isFast ? 1.5 : 1);
        this._player.rotation.z =
            Math.min(this._player.rotation.z + this.StepRot.z, this.MaxRot.z);
    }
    else if (this.isInputWhirlRight())
    {
        this._player.rotation.y -= this.StepRot.y * (isFast ? 1.5 : 1);
        this._player.rotation.z =
            Math.max(this._player.rotation.z - this.StepRot.z, -this.MaxRot.z);
    }
    else if (this._player.rotation.z !== 0)
    {
        // 旋回操作をやめたら徐々に水平に戻す
        if (this._player.rotation.z < 0)
        {
            this._player.rotation.z =
                Math.min(this._player.rotation.z + this.StepRot.z, 0);
        }
        else
        {
            this._player.rotation.z =
                Math.max(this._player.rotation.z - this.StepRot.z, 0);
        }
    }
};

/**
 * ピッチアップ/ダウン処理
 */
Game_3DMap.prototype.updatePitch = function()
{
    if (this.isInputPitchDown())
    {
        this._player.position.y =
            Math.max(this._player.position.y - this.StepPos.y, this.MinPos.y);
    }
    else if (this.isInputPitchUp())
    {
        this._player.position.y =
            Math.min(this._player.position.y + this.StepPos.y, this.MaxPos.y);
    }
};

/**
 * 前進入力判定
 */
Game_3DMap.prototype.isInputForward = function()
{
    return Input.isPressed('ok') || this.isTouchAccelArea();
};

/**
 * 後退入力判定
 */
Game_3DMap.prototype.isInputBackward = function()
{
    return Input.isPressed('pagedown');
};

/**
 * 高速移動入力判定
 */
Game_3DMap.prototype.isInputFast = function()
{
    return Input.isPressed('shift');
};

/**
 * 左旋回入力判定
 */
Game_3DMap.prototype.isInputWhirlLeft = function()
{
    return Input.isPressed('left') || this.isTouchWhirlArea('left');
};

/**
 * 右旋回入力判定
 */
Game_3DMap.prototype.isInputWhirlRight = function()
{
    return Input.isPressed('right') || this.isTouchWhirlArea('right');
};

/**
 * ピッチアップ入力判定
 */
Game_3DMap.prototype.isInputPitchUp = function()
{
    return Input.isPressed('down');
};

/**
 * ピッチダウン入力判定
 */
Game_3DMap.prototype.isInputPitchDown = function()
{
    return Input.isPressed('up');
};

/**
 * 前進領域タッチ中判定
 */
Game_3DMap.prototype.isTouchAccelArea = function()
{
    if (!TouchInput.isPressed())
    {
        return false;
    }

    var areaWidth = Math.floor(Graphics.width * Params.touchArea.accel);
    var areaX = Math.floor((Graphics.width - areaWidth) / 2);
    var touchX = TouchInput.x;
    
    return touchX >= areaX && touchX <= areaX + areaWidth;
};

/**
 * 旋回領域タッチ中判定
 */
Game_3DMap.prototype.isTouchWhirlArea = function(dir)
{
    if (!TouchInput.isPressed())
    {
        return false;
    }

    var areaWidth = Math.floor(Graphics.width * Params.touchArea.whirl / 2);
    var touchX = TouchInput.x;
    switch (dir)
    {
        case 'left': return touchX <= areaWidth;
        case 'right': return touchX >= Graphics.width - areaWidth;
        default: return false;
    }
};


//-----------------------------------------------------------------------------
// Spriteset_Map

Spriteset_Map.prototype.captureFor3D = function()
{
    // 3D モード用スイッチによる変更を反映
    $gameMap.refreshIfNeeded();
    this._characterSprites.forEach(function(sprite)
    {
        sprite.update();
    });

    this._vehicleSprites.forEach(function(sprite)
    {
        sprite.scale.x = sprite.scale.y = 1.5;

        // 乗り物スプライトを tilemap とは別の領域に表示
        this._tilemap.removeChild(sprite);
        this._pseudoTilemap.addChild(sprite);
    }, this);

    this._shadowSprite.visible = false;

    var map3d = $gameMap.get3DMap();
    var tilemapIndex = this._baseSprite.children.indexOf(this._tilemap);
    this._baseSprite.removeChild(this._tilemap);
    map3d.captureTilemap(this._baseSprite, this._tilemap, this._characterSprites);
    this._baseSprite.addChildAt(map3d, tilemapIndex);

    var rollMargin = 112;
    this._parallax.anchor.x = this._parallax.anchor.y = 0.5;
    this._parallax.move(
        Graphics.width / 2,
        Graphics.height / 2,
        Graphics.width + rollMargin * 3 / 2,
        Graphics.height + rollMargin * 2);
};

Spriteset_Map.prototype.unCaptureFor3D = function()
{
    this._parallax.anchor.x = this._parallax.anchor.y = 0;
    this._parallax.move(0, 0, Graphics.width, Graphics.height);

    var map3d = $gameMap.get3DMap();
    var tilemapIndex = this._baseSprite.children.indexOf(map3d);
    this._baseSprite.removeChild(map3d);
    map3d.unCaptureTilemap();
    this._baseSprite.addChildAt(this._tilemap, tilemapIndex);

    this._shadowSprite.visible = true;

    this._vehicleSprites.forEach(function(sprite, index)
    {
        sprite.scale.x = sprite.scale.y = 1;

        // 乗り物スプライトを tilemap 配下に戻す
        this._pseudoTilemap.removeChild(sprite);
        this._tilemap.addChildAt(sprite, this._vehicleSpriteChildIndex + index);
    }, this);

    // 3D モード用スイッチによる変更を反映
    $gameMap.refreshIfNeeded();
    this._characterSprites.forEach(function(sprite)
    {
        sprite.update();
    });
};

Spriteset_Map.prototype.createCharacters = function()
{
    this._pseudoTilemap = new Sprite();
    this._baseSprite.addChild(this._pseudoTilemap);
    this._characterSprites = [];
    this._vehicleSprites = [];
    $gameMap.events().forEach(function(event) {
        this._characterSprites.push(new Sprite_Character(event));
    }, this);

    // 3D モードからの復帰用に、乗り物スプライトの追加位置を記憶
    this._vehicleSpriteChildIndex = this._characterSprites.length - 1;

    $gameMap.vehicles().forEach(function(vehicle) {
        var sprite = new Sprite_Character(vehicle);
        this._characterSprites.push(sprite);
        this._vehicleSprites.push(sprite);
    }, this);
    $gamePlayer.followers().reverseEach(function(follower) {
        this._characterSprites.push(new Sprite_Character(follower));
    }, this);
    this._characterSprites.push(new Sprite_Character($gamePlayer));
    for (var i = 0; i < this._characterSprites.length; i++) {
        this._tilemap.addChild(this._characterSprites[i]);
    }
};

var _KMS_3DVehicle_Spriteset_Map_updateParallax = Spriteset_Map.prototype.updateParallax;
Spriteset_Map.prototype.updateParallax = function()
{
    if ($gameMap.is3DMode())
    {
        this.updateParallaxFor3D();
    }
    else
    {
        _KMS_3DVehicle_Spriteset_Map_updateParallax.call(this);
    }
}

Spriteset_Map.prototype.updateParallaxFor3D = function()
{
    if (this._parallaxName !== $gameMap.parallaxName())
    {
        this._parallaxName = $gameMap.parallaxName();
        this._parallax.bitmap = ImageManager.loadParallax(this._parallaxName);
    }
    if (this._parallax.bitmap)
    {
        var map3d = $gameMap.get3DMap();
        this._parallax.origin.x = map3d.parallaxOx();
        this._parallax.origin.y = map3d.parallaxOy();
        this._parallax.rotation = map3d.parallaxRotation();
    }
};

var _KMS_3DVehicle_Spriteset_Map_updateTilemap = Spriteset_Map.prototype.updateTilemap;
Spriteset_Map.prototype.updateTilemap = function()
{
    _KMS_3DVehicle_Spriteset_Map_updateTilemap.call(this);

    if ($gameMap.is3DMode())
    {
        $gameMap.get3DMap().render3d();
    }
};


//-----------------------------------------------------------------------------
// Scene_Map

var _KMS_3DVehicle_Scene_Map_create = Scene_Map.prototype.create;
Scene_Map.prototype.create = function()
{
    _KMS_3DVehicle_Scene_Map_create.call(this);

    this._last3DMapMode = false;
    $gameMap.create3DMap();

    // XXX: マップ移動の場合は 3D 解除 (暫定)
    if (this._transfer)
    {
        $gameMap.set3DMode(false);
    }
    else
    {
        $gameMap.restore3DMapInfo();
    }

    $gameMap.set3DModeCallback(this, this.set3DMode);
};

var _KMS_3DVehicle_Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function()
{
    _KMS_3DVehicle_Scene_Map_createDisplayObjects.call(this);

    // 前回の 3D 状態の復元
    this.set3DMode($gameMap.is3DMode());
};

var _KMS_3DVehicle_Scene_Map_stop = Scene_Map.prototype.stop;
Scene_Map.prototype.stop = function()
{
    if ($gameMap.is3DMode())
    {
        $gameMap.save3DMapInfo();
    }

    _KMS_3DVehicle_Scene_Map_stop.call(this);
};

var _KMS_3DVehicle_Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function()
{
    _KMS_3DVehicle_Scene_Map_update.call(this);
};

var _KMS_3DVehicle_Scene_Map_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate = function()
{
    _KMS_3DVehicle_Scene_Map_terminate.call(this);

    $gameMap.dispose3DMap();
};

Scene_Map.prototype.set3DMode = function(enabled)
{
    if (this._last3DMapMode !== enabled)
    {
        this._last3DMapMode = enabled;
        if (enabled)
        {
            this._spriteset.captureFor3D();
        }
        else
        {
            this._spriteset.unCaptureFor3D();
        }
    }
};

var _KMS_3DVehicle_Scene_Map_isMenuCalled = Scene_Map.prototype.isMenuCalled;
Scene_Map.prototype.isMenuCalled = function()
{
    if ($gamePlayer.isInVehicle())
    {
        return false;
    }

    return _KMS_3DVehicle_Scene_Map_isMenuCalled.call(this);
};

})();
