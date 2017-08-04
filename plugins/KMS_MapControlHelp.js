//=============================================================================
// KMS_MapControlHelp.js
//   Last update: 2017/08/04
//=============================================================================

/*:
 * @plugindesc
 * [v0.1.0] Show button help for events on map.
 *
 * @author TOMY (Kamesoft)
 *
 * @param Display position
 * @default 4
 * @desc
 *  Display position of the help.
 *  0: Top-L  1: Top-R  2: Bottom-L  3: Bottom-R  4: Player
 *
 * @param Default help button
 * @default A
 * @desc Default button name for control help.
 *
 * @param Default event help
 * @default Check
 * @desc Default help text for event.
 *
 * @param Default vehicle help
 * @default Get on
 * @desc Default help text for vehicle.
 *
 * @param Opacity frame
 * @default 12
 * @desc Fade time (frames) for showing/hiding control-help.
 *
 *
 * @help
 *
 * ## Plugin command
 *
 * MapControlHelp enable    # Enable control help on map
 * MapControlHelp disable   # Disable control help on map
 *
 */

/*:ja
 * @plugindesc
 * [v0.1.0] マップ上で、イベント起動用のヘルプを表示する機能を追加します。
 *
 * @author TOMY (Kamesoft)
 *
 * @param Display position
 * @default 4
 * @desc
 *  操作ヘルプの表示位置です。
 *  0: 左上  1: 右上  2: 左下  3: 右下  4: プレイヤー
 *
 * @param Default help button
 * @default Ａ
 * @desc ボタン指定をしなかった場合に、操作ヘルプに表示するボタン名です。
 *
 * @param Default event help
 * @default 調べる
 * @desc イベントに操作ヘルプを設定しなかった場合に表示するテキストです。空欄にすると表示しなくなります。
 *
 * @param Default vehicle help
 * @default 乗る
 * @desc 乗り物に乗れるときに表示するテキストです。空欄にすると表示しなくなります。
 *
 * @param Opacity frame
 * @default 12
 * @desc 操作ヘルプの表示/非表示切り替えにかける時間をフレーム単位で指定します。
 *
 *
 * @help
 *
 * ■ プラグインコマンド
 *
 * MapControlHelp enable    # マップ上の操作ヘルプを有効にします。
 * MapControlHelp disable   # マップ上の操作ヘルプを無効にします。
 *
 */

var KMS = KMS || {};

(function() {

'use strict';

var PluginName = 'KMS_MapControlHelp';

KMS.imported = KMS.imported || {};
KMS.imported['MapControlHelp'] = true;

// 数値判定
function isNumber(value)
{
    if (typeof value != 'number' &&
        typeof value != 'string')
    {
        return false;
    }

    return value == parseFloat(value) && isFinite(value);
}

// プラグインパラメータの解析
var pluginParams = PluginManager.parameters(PluginName);
var Params = {};
Params.displayPosition = isNumber(pluginParams['Display position']) ?
    Math.min(Math.max(parseInt(pluginParams['Display position']), 0), 4) :
    4;
Params.opacityStep = isNumber(pluginParams['Opacity frame']) ?
    255 / Math.max(parseInt(pluginParams['Opacity frame']), 1) :
    24;
Params.defaultHelp =
{
    button:  pluginParams['Default help button'],
    event:   pluginParams['Default event help'],
    vehicle: pluginParams['Default vehicle help']
};

// 定数
var Const =
{
    debug:             false,               // デバッグモード
    pluginCommandCode: 'MapControlHelp',    // プラグインコマンドコード

    // ヘルプ表示位置
    displayPosition:
    {
        topLeft:     0,     // 画面左上
        topRight:    1,     // 画面右上
        bottomLeft:  2,     // 画面左下
        bottomRight: 3,     // 画面右下
        player:      4      // プレイヤー位置付近
    },

    // 注釈解析用の正規表現
    regex:
    {
        checkHelpWithButton: /<(?:操作ヘルプ|ControlHelp)\s*[:\s]\s*([^;]+);\s*([^>]+)>/i,
        checkHelpNoButton:   /<(?:操作ヘルプ|ControlHelp)\s*[:\s]\s*([^>]+)>/i,
        checkHelpDefault:    /<(?:操作ヘルプ|ControlHelp)\s*>/i
    }
};

// デバッグログ
var debuglog;
if (Const.debug)
{
    debuglog = function() { console.log(arguments); }
}
else
{
    debuglog = function() { }
}


var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args)
{
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command !== Const.pluginCommandCode)
    {
        return;
    }

    switch (args[0])
    {
    case 'enable':      // 有効化
        $gameSystem.setMapControlHelpEnabled(true);
        break;

    case 'disable':     // 無効化
        $gameSystem.setMapControlHelpEnabled(false);
        break;

    default:
        // 不明なコマンド
        console.error('[%1 %2] Unknown command.'.format(Const.pluginCommandCode, args[0]));
        break;
    }
};


//-----------------------------------------------------------------------------
// Game_Temp

var _Game_Temp_initialize = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function()
{
    _Game_Temp_initialize.call(this);

    this._mapControlHelp = null;
};

/**
 * 操作ヘルプの設定
 */
Game_Temp.prototype.setMapControlHelp = function(help)
{
    this._mapControlHelp = help;
};

/**
 * 操作ヘルプのクリア
 */
Game_Temp.prototype.clearMapControlHelp = function()
{
    this._mapControlHelp = null;
};

/**
 * 操作ヘルプの取得
 */
Game_Temp.prototype.getMapControlHelp = function()
{
    return this._mapControlHelp;
};


//-----------------------------------------------------------------------------
// Game_System

/**
 * 操作ヘルプの有効状態を取得
 */
Game_System.prototype.isMapControlHelpEnabled = function()
{
    return this._mapControlHelpEnabled != null ? this._mapControlHelpEnabled : true;
};

/**
 * 操作ヘルプの有効状態を設定
 */
Game_System.prototype.setMapControlHelpEnabled = function(enabled)
{
    this._mapControlHelpEnabled = !!enabled;
};


//-----------------------------------------------------------------------------
// Game_Map

var _Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId)
{
    _Game_Map_setup.call(this, mapId);

    this._needsUpdateControlHelp = true;
};

/**
 * 操作ヘルプの更新要求
 */
Game_Map.prototype.requestUpdateControlHelp = function()
{
    this._needsUpdateControlHelp = true;
};

var _Game_Map_update = Game_Map.prototype.update;
Game_Map.prototype.update = function(sceneActive)
{
    _Game_Map_update.call(this, sceneActive);

    this.updateControlHelpIfNeeded();
};

/**
 * 操作ヘルプを更新
 */
Game_Map.prototype.updateControlHelpIfNeeded = function()
{
    // 乗り物搭乗中は表示しない
    if ($gamePlayer.isInVehicle())
    {
        // 乗り物から降りたときにすぐヘルプを更新できるようにする
        this.requestUpdateControlHelp();
        $gameTemp.clearMapControlHelp();
        return;
    }

    // イベント起動より乗り物昇降の方が優先されるので、先に乗り物を探す
    var target = $gamePlayer.findTriggerActionVehicle();
    if (target == null ||
        target.getMapControlHelp() == null)
    {
        // 負荷軽減のため、イベントは更新要求がある場合のみ処理する
        if (!this._needsUpdateControlHelp)
        {
            return;
        }

        this._needsUpdateControlHelp = false;

        // ボタンヘルプを表示できるイベントを探す
        target = $gamePlayer.findAvailableMapControlHelpEvent();
    }

    if (target == null)
    {
        // 表示対象なし
        $gameTemp.clearMapControlHelp();
        return;
    }

    var help = target.getMapControlHelp();
    if (help == null)
    {
        $gameTemp.clearMapControlHelp();
    }
    else
    {
        $gameTemp.setMapControlHelp(help);
    }
};

var _Game_Map_refresh = Game_Map.prototype.refresh;
Game_Map.prototype.refresh = function()
{
    _Game_Map_refresh.call(this);

    this.requestUpdateControlHelp();
};


//-----------------------------------------------------------------------------
// Game_CharacterBase

var _Game_CharacterBase_setDirection = Game_CharacterBase.prototype.setDirection;
Game_CharacterBase.prototype.setDirection = function(d)
{
    _Game_CharacterBase_setDirection.call(this, d);

    // 移動時には方向指定があるはずなので、ここで操作ヘルプの更新要求を出す
    if ($gameMap != null)
    {
        $gameMap.requestUpdateControlHelp();
    }
};


//-----------------------------------------------------------------------------
// Game_Player

/**
 * トリガー操作で搭乗可能な乗り物を探す
 */
Game_Player.prototype.findTriggerActionVehicle = function()
{
    if (!this.canMove())
    {
        return null;
    }

    var direction = this.direction();
    var x1 = this.x;
    var y1 = this.y;
    var x2 = $gameMap.roundXWithDirection(x1, direction);
    var y2 = $gameMap.roundYWithDirection(y1, direction);
    if ($gameMap.airship().pos(x1, y1))
    {
        return $gameMap.airship();
    }
    else if ($gameMap.ship().pos(x2, y2))
    {
        return $gameMap.ship();
    }
    else if ($gameMap.boat().pos(x2, y2))
    {
        return $gameMap.boat();
    }

    return null;
}

/**
 * 操作ヘルプを表示可能なイベントを探す
 */
Game_Player.prototype.findAvailableMapControlHelpEvent = function()
{
    if (!this.canMove())
    {
        return null;
    }

    // ****
    // 決定トリガーイベントを優先して探す

    // 現在位置
    {
        // 決定トリガーのみ
        var events = this.findTriggerEventsHere([0]);
        if (events != null && events.length > 0)
        {
            return events[0];
        }
    }

    // 向いている方向
    {
        // 決定/接触トリガーのみ
        var events = this.findTriggerEventsThere([0, 1, 2]);
        if (events != null && events.length > 0)
        {
            return events[0];
        }
    }

    // TODO: タッチ対応は必要？ (タッチ操作の仕様的にいらなそうではある)

    // ****
    // 現在位置にボタン指定ヘルプがあれば返す
    {
        // 決定トリガー以外が対象
        // (決定トリガーはこの前に検出されているはず)
        var events = this.findTriggerEventsHere([1, 2, 3, 4]);
        if (events != null)
        {
            for (var i = 0; i < events.length; i++)
            {
                if (events[i].hasButtonSpecifiedMapControlHelp())
                {
                    return events[i];
                }
            }
        }
    }

    return null;
};

/**
 * 指定条件で起動可能なイベントを探す
 */
Game_Player.prototype.findRunnableMapEvents = function(x, y, triggers, normal)
{
    if ($gameMap.isEventRunning())
    {
        return null;
    }

    var events = $gameMap.eventsXy(x, y).filter(function(event)
    {
        return event.isTriggerIn(triggers) && event.isNormalPriority() === normal;
    });

    return events;
};

/**
 * 現在位置にある起動可能なイベントを探す
 */
Game_Player.prototype.findTriggerEventsHere = function(triggers)
{
    if (!this.canStartLocalEvents())
    {
        return null;
    }

    return this.findRunnableMapEvents(this.x, this.y, triggers, false);
};

/**
 * 前方にある起動可能なイベントを探す
 */
Game_Player.prototype.findTriggerEventsThere = function(triggers)
{
    if (!this.canStartLocalEvents())
    {
        return null;
    }

    var direction = this.direction();
    var x1 = this.x;
    var y1 = this.y;
    var x2 = $gameMap.roundXWithDirection(x1, direction);
    var y2 = $gameMap.roundYWithDirection(y1, direction);
    var event = this.findRunnableMapEvents(x2, y2, triggers, true);

    if (!event && $gameMap.isCounter(x2, y2))
    {
        var x3 = $gameMap.roundXWithDirection(x2, direction);
        var y3 = $gameMap.roundYWithDirection(y2, direction);
        return this.findRunnableMapEvents(x3, y3, triggers, true);
    }
    else
    {
        return event;
    }
};

/**
 * 前方にあるタッチ起動可能なイベントを探す
 * 今のところ未使用
 */
Game_Player.prototype.findTriggerEventsTouchFront = function(d)
{
    var x2 = $gameMap.roundXWithDirection(this._x, d);
    var y2 = $gameMap.roundYWithDirection(this._y, d);
    return this.findTriggerEventsTouch(x2, y2);
};

/**
 * 指定位置にあるタッチ起動可能なイベントを探す
 * 今のところ未使用
 */
Game_Player.prototype.findTriggerEventsTouch = function(x, y)
{
    if (!this.canStartLocalEvents())
    {
        return null;
    }

    return this.findRunnableMapEvents(x, y, [1,2], true);
};


//-----------------------------------------------------------------------------
// Game_Event

var _Game_Event_setupPage = Game_Event.prototype.setupPage;
Game_Event.prototype.setupPage = function()
{
    _Game_Event_setupPage.call(this);

    this.setupMapControlHelp();
};

/**
 * イベント起動のための操作ヘルプを構築
 */
Game_Event.prototype.setupMapControlHelp = function()
{
    this._mapControlHelp = null;

    var page = this.page();
    if (page == null)
    {
        return;
    }

    // 注釈コマンドかどうか
    var isComment = function(command)
    {
        return command && (command.code === 108 || command.code === 408);
    };

    // 注釈以外に達するまで解析
    var commands = page.list;
    var index    = 0;
    var command  = commands[index++];
    while (isComment(command))
    {
        var comment = command.parameters[0];
        var match;

        // ボタン指定あり
        match = Const.regex.checkHelpWithButton.exec(comment);
        if (match != null)
        {
            this._mapControlHelp = { button: match[1], text: match[2] };
            break;
        }

        // ボタン指定なし
        match = Const.regex.checkHelpNoButton.exec(comment);
        if (match != null)
        {
            this._mapControlHelp = { button: Params.defaultHelp.button, text: match[1] };
            break;
        }

        // デフォルト値
        if (Const.regex.checkHelpDefault.test(comment) &&
            Params.defaultHelp.event != null &&
            Params.defaultHelp.event !== '')
        {
            this._mapControlHelp = { button: Params.defaultHelp.button, text: Params.defaultHelp.event };
            break;
        }

        command = commands[index++];
    }
};

/**
 * イベント起動のための操作ヘルプを取得
 */
Game_Event.prototype.getMapControlHelp = function()
{
    return this._mapControlHelp;
};

/**
 * ボタン指定の操作ヘルプが設定されているか
 */
Game_Event.prototype.hasButtonSpecifiedMapControlHelp = function()
{
    var help = this.getMapControlHelp();
    return help != null && help.button !== Params.defaultHelp.button;
};


//-----------------------------------------------------------------------------
// Game_Vehicle

/**
 * 搭乗のための操作ヘルプを取得
 */
Game_Vehicle.prototype.getMapControlHelp = function()
{
    if (Params.defaultHelp.vehicle == null)
    {
        return null;
    }
    else
    {
        return { button: Params.defaultHelp.button, text: Params.defaultHelp.vehicle };
    }
};


//-----------------------------------------------------------------------------
// Window_MapControlHelp
//
// マップ上で操作ヘルプを表示するウィンドウ

function Window_MapControlHelp()
{
    this.initialize.apply(this, arguments);
}

Window_MapControlHelp.prototype = Object.create(Window_Base.prototype);
Window_MapControlHelp.prototype.constructor = Window_MapControlHelp;

Window_MapControlHelp.prototype.initialize = function()
{
    Window_Base.prototype.initialize.call(this, 0, 0, 128, this.fittingHeight(1));

    this.contentsOpacity = 0;
    this.openness        = 0;
    this.setBackgroundType(1);

    this._button      = null;
    this._text        = null;
    this._opacityStep = 0;
};

Window_MapControlHelp.prototype.createContents = function()
{
    Window_Base.prototype.createContents.call(this);
    this.updateFontSize();
    this.refreshDimmerBitmap();
};

/**
 * テキスト内容に応じたウィンドウ幅を取得
 */
Window_MapControlHelp.prototype.windowWidth = function()
{
    var width = (this.standardPadding() + this.textPadding()) * 2;

    if (this._button != null)
    {
        width += this.textWidth(this._button) + this.textPadding() * 2;
    }

    if (this._text != null)
    {
        width += this.textWidth(this._text) + this.textPadding();
    }

    return width;
};

/**
 * ヘルプの設定
 */
Window_MapControlHelp.prototype.setHelp = function(button, text)
{
    if (this._button === button && this._text === text)
    {
        return;
    }

    this._button = button;
    this._text   = text;
    this.refresh();
    this.show();
};

/**
 * 表示
 */
Window_MapControlHelp.prototype.show = function()
{
    // フェードイン開始
    this._opacityStep = Params.opacityStep;
};

/**
 * 非表示
 */
Window_MapControlHelp.prototype.hide = function()
{
    // フェードアウト開始
    this._opacityStep = this.openness > 0 ? -Params.opacityStep : 0;
    this._button = null;
    this._text   = null;
};

/**
 * フレーム毎の更新
 */
Window_MapControlHelp.prototype.update = function()
{
    Window_Base.prototype.update.call(this);

    this.updateOpacity();

    // プレイヤー位置への追従
    if (Params.displayPosition == Const.displayPosition.player &&
        this.openness > 0)
    {
        this.updatePositionByPlayer();
    }
};

/**
 * 不透明度の更新
 */
Window_MapControlHelp.prototype.updateOpacity = function()
{
    if (this._opacityStep === 0)
    {
        return;
    }

    var opacity = (this.openness + this._opacityStep).clamp(0, 255);
    this.contentsOpacity = opacity;
    this.openness        = opacity;
    if (opacity <= 0 || opacity >= 255)
    {
        // フェード終了
        this._opacityStep = 0;
    }
};

/**
 * 表示位置の更新
 */
Window_MapControlHelp.prototype.updatePosition = function()
{
    var mx = Graphics.boxWidth  - this.width;
    var my = Graphics.boxHeight - this.height;

    switch (Params.displayPosition)
    {
    default:
    case Const.displayPosition.topLeft:
        this.x = 0;
        this.y = -this.standardPadding();
        break;

    case Const.displayPosition.topRight:
        this.x = mx;
        this.y = -this.standardPadding();
        break;

    case Const.displayPosition.bottomLeft:
        this.x = 0;
        this.y = my + this.standardPadding();
        break;

    case Const.displayPosition.bottomRight:
        this.x = mx;
        this.y = my + this.standardPadding();
        break;

    case Const.displayPosition.player:
        this.updatePositionByPlayer();
        break;
    }
};

/**
 * 表示位置の更新 (プレイヤー位置用)
 */
Window_MapControlHelp.prototype.updatePositionByPlayer = function()
{
    // デフォルトの位置は右下
    var x = $gamePlayer.screenX();
    var y = $gamePlayer.screenY();

    // 画面右側にはみ出る場合は左に表示
    if (x + this.width > Graphics.boxWidth)
    {
        x -= this.width;
    }

    // 画面下側にはみ出る場合は上に表示
    if (y + this.height > Graphics.boxHeight)
    {
        y -= this.height + $gameMap.tileHeight();
    }

    this.x = x;
    this.y = y;
}

/**
 * フォントサイズの更新
 */
Window_MapControlHelp.prototype.updateFontSize = function()
{
    this.contents.fontSize = this.standardFontSize() * 0.75;
}

/**
 * 再描画
 */
Window_MapControlHelp.prototype.refresh = function()
{
    var width = this.windowWidth();
    this.width = width;
    this.updatePosition();
    this.createContents();

    var x = this.textPadding();
    if (this._button)
    {
        // ボタン名
        this.changeTextColor(this.systemColor());
        this.drawText(this._button, x, 0, width);
        this.resetTextColor();
        x += this.textWidth(this._button) + this.textPadding() * 2;
    }

    if (this._text)
    {
        // アクション
        this.drawText(this._text, x, 0, width);
    }
};


//-----------------------------------------------------------------------------
// Scene_Map

var _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function()
{
    _Scene_Map_createAllWindows.call(this);

    this.createControlHelpWindow();
};

/**
 * 操作ヘルプウィンドウの作成
 */
Scene_Map.prototype.createControlHelpWindow = function()
{
    this._controlHelpWindow = new Window_MapControlHelp();
    this.addChild(this._controlHelpWindow);
};

var _Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function()
{
    _Scene_Map_update.call(this);

    this.updateControlHelpDisplay();
};

/**
 * 操作ヘルプの表示を更新
 */
Scene_Map.prototype.updateControlHelpDisplay = function()
{
    var help = $gameTemp.getMapControlHelp();
    if (help != null && $gameSystem.isMapControlHelpEnabled())
    {
        this._controlHelpWindow.setHelp(help.button, help.text);
    }
    else
    {
        this._controlHelpWindow.hide();
    }
};

})();

