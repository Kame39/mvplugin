//=============================================================================
// KMS_FlexibleScope.js
//   Last update: 2018/01/01
//=============================================================================

/*:
 * @plugindesc
 * [v0.2.0] The function which is switching targets of item/skill single and all.
 *
 * @author Kameo (Kamesoft)
 *
 * @param Switch for-all button
 * @default shift
 * @desc Button for switching single / for-all when selecting a target.
 *
 * @param Damage rate for-all
 * @default 0.7
 * @desc Damage rate when force for-all effect is applied to a item / skill.
 *
 * @param MP cost rate for-all
 * @default 1
 * @desc MP cost rate when force for-all effect is applied to a item / skill.
 *
 * @help This plugin does not provide plugin commands.
 *
 * Add <kms_flexible_scope> to the note of an item or a skill.
 * Then, it can be switched its scope single and all.
 *
 * Add <kms_prevent_flexible_scope>, it prevents the flexible scope effect given by other factors.
 *
 * Add <kms_for_all_animation_id: n>, use animation ID:n instead of the original animation when target is for-all.
 */

/*:ja
 * @plugindesc
 * [v0.2.0] スキル、アイテムに単体 / 全体切り替え機能を追加します。
 *
 * @author かめお (Kamesoft)
 *
 * @param Switch for-all button
 * @default shift
 * @desc 対象選択時に、単体 / 全体を切り替えるボタンです。
 *
 * @param Damage rate for-all
 * @default 0.7
 * @desc 全体化時のダメージ倍率です。
 *
 * @param MP cost rate for-all
 * @default 1
 * @desc 全体化時の MP 消費倍率です。
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * 対象が単体のスキルメモ欄に <kms_flexible_scope> を追加すると、対象の単体 / 全体切り替えが可能になります。
 * <kms_prevent_flexible_scope> を追加すると、別の要因によって付与される全体化を受け付けなくなります。
 * <kms_for_all_animation_id: n> を追加すると、全体化時にアニメーションが n 番に差し替えられます。
 *
 */

var KMS = KMS || {};

(function() {

'use strict';

KMS.imported = KMS.imported || {};
KMS.imported['FlexibleScope'] = true;

var pluginParams = PluginManager.parameters('KMS_FlexibleScope');
var Params = {};
Params.forAllButton = pluginParams['Switch for-all button'] || 'shift';
Params.forceForAllDamageRate = Number(pluginParams['Damage rate for-all']) || 0.7;
Params.forceForAllMpCostRate = Number(pluginParams['MP cost rate for-all']) || 1;


//=============================================================================

/**
 * 全体化判定
 */
function isFlexibleScope(item)
{
    return item && item.meta.kms_flexible_scope;
}

/**
 * 全体化拒否判定
 */
function isPreventFlexibleScope(item)
{
    return item && item.meta.kms_prevent_flexible_scope;
}

/**
 * 全体化時のアニメーション
 */
function getAnimationIdForAll(item)
{
    return (item ? parseInt(item.meta.kms_for_all_animation_id) : null);
}


//-----------------------------------------------------------------------------
// Game_Action

var _Game_Action_initialize = Game_Action.prototype.initialize;
Game_Action.prototype.initialize = function(subject, forcing)
{
    _Game_Action_initialize.call(this, subject, forcing);

    if (subject.isNextActionForceForAll())
    {
        // 次の行動は強制全体化
        this._permanentForAll = true;
    }
};

var _Game_Action_setSkill = Game_Action.prototype.setSkill;
Game_Action.prototype.setSkill = function(skillId)
{
    _Game_Action_setSkill.call(this, skillId);
    this.resetForceForAll();
};

var _Game_Action_setItem = Game_Action.prototype.setItem;
Game_Action.prototype.setItem = function(itemId)
{
    _Game_Action_setItem.call(this, itemId);
    this.resetForceForAll();
};

var _Game_Action_setItemObject = Game_Action.prototype.setItemObject;
Game_Action.prototype.setItemObject = function(object)
{
    _Game_Action_setItemObject.call(this, object);
    this.resetForceForAll();
};

var _Game_Action_isForOne = Game_Action.prototype.isForOne;
Game_Action.prototype.isForOne = function()
{
    return _Game_Action_isForOne.call(this) && !this.isForceForAll();
};

var _Game_Action_isForAll = Game_Action.prototype.isForAll;
Game_Action.prototype.isForAll = function()
{
    return _Game_Action_isForAll.call(this) || this.isForceForAll();
};

var _Game_Action_evalDamageFormula = Game_Action.prototype.evalDamageFormula ;
Game_Action.prototype.evalDamageFormula = function(target)
{
    var value = _Game_Action_evalDamageFormula.call(this, target);

    // 全体化時の威力変動
    //  XXX: makeDamageValue 内で補正すると分散適用後の値を補正してしまうので、
    //       とりあえずここで補正しておく
    if (this.isForceForAll())
    {
        value *= this.getForceForAllDamageRate();
    }
    return value;
};

/**
 * 現在の行動の全体化可否判定
 */
Game_Action.prototype.isFlexibleScope = function()
{
    var item = this.item();

    if (isPreventFlexibleScope(item))
    {
        return false;
    }

    return isFlexibleScope(item) ||
        this.subject().isFlexibleScopeItem(item);
};

/**
 * 全体化指定のリセット
 */
Game_Action.prototype.resetForceForAll = function()
{
    this._forceForAll = false;
};

/**
 * 全体化指定
 */
Game_Action.prototype.setForceForAll = function(enabled)
{
    if (this.isFlexibleScope())
    {
        this._forceForAll = enabled;
    }
};

/**
 * 全体化指定されたか
 */
Game_Action.prototype.isForceForAll = function()
{
    return this._forceForAll || this._permanentForAll;
};

/**
 * 全体化指定時のダメージ倍率を取得
 */
Game_Action.prototype.getForceForAllDamageRate = function()
{
    return Params.forceForAllDamageRate;
};


//-----------------------------------------------------------------------------
// Game_BattlerBase

/**
 * 指定アイテム / スキルの全体化可否判定
 */
Game_BattlerBase.prototype.isFlexibleScopeItem = function(item)
{
    // 他のプラグインで上書きするための関数
    return false;
};


//-----------------------------------------------------------------------------
// Game_Battler

var _KMS_Game_Battler_skillMpCost = Game_Battler.prototype.skillMpCost;
Game_Battler.prototype.skillMpCost = function(skill)
{
    var value = _KMS_Game_Battler_skillMpCost.call(this, skill);

    // 全体化時の MP 消費変動
    var action = this.currentAction();
    if (action && action.isForceForAll())
    {
        value = Math.floor(value * Params.forceForAllMpCostRate);
    }
    return value;
};

/**
 * 次の行動を強制全体化するか
 */
Game_Battler.prototype.isNextActionForceForAll = function()
{
    return this._forceForAllNextAction;
};

/**
 * 次の行動を強制全体化するか設定
 */
Game_Battler.prototype.setNextActionForceForAll = function(enabled)
{
    this._forceForAllNextAction = enabled ? true : undefined;
};


//-----------------------------------------------------------------------------
// Game_Unit

/**
 * アクションに対応した全メンバーの選択
 */
Game_Unit.prototype.selectAllByAction = function(action)
{
    var members = action.isForDeadFriend() ?
        this.deadMembers() :
        this.aliveMembers();
    members.forEach(function(member)
    {
        member.select();
    });
};


//-----------------------------------------------------------------------------
// Window_MenuActor

/**
 * 単体 / 全体切り替え処理
 *
 * @return 切り替えが実行された場合は true
 */
function processChangingForAll()
{
    // 全体化切り替え操作を行っているか
    function isChangingForAll()
    {
        if (Input.isTriggered(Params.forAllButton))
        {
            return true;
        }

        if (this.cursorAll())
        {
            // 全体選択中はカーソル移動またはキャンセルで解除
            if (Input.isTriggered('left') ||
                Input.isTriggered('right') ||
                Input.isTriggered('up') ||
                Input.isTriggered('down') ||
                Input.isTriggered('cancel'))
            {
                return true;
            }
        }
        else
        {
            var index    = this.index();
            var maxItems = this.maxItems();
            var maxCols  = this.maxCols();
            var maxRows  = this.maxRows();
            if (maxCols === 1)
            {
                // 一列表示なら ← or → で全体化
                if (Input.isTriggered('left') || Input.isTriggered('right'))
                {
                    return true;
                }
            }
            /*  敵選択時の挙動を統一するためにとりあえず無効化
            else if (maxRows === 1)
            {
                // 一行表示なら ↑ or ↓ で全体化
                if (Input.isTriggered('up') || Input.isTriggered('down'))
                {
                    return true;
                }
            }
            */
            else
            {
                if (Input.isTriggered('up') && index < maxCols)
                {
                    // 最上段で↑
                    return true;
                }
                else if (Input.isTriggered('down') &&
                    (index + maxCols - 1) / maxCols >= maxRows - 1)
                {
                    // 最下段で↓
                    return true;
                }
                else if (Input.isTriggered('left') && index === 0)
                {
                    // 先頭で←
                    return true;
                }
                else if (Input.isTriggered('right') && index >= maxItems - 1)
                {
                    // 末尾で→
                    return true;
                }
            }
        }

        return false;
    }

    // 全体化操作用のカーソル移動可否 (全体カーソル表示中も許可する)
    function isCursorMovableForAll()
    {
        return this.isOpenAndActive() &&
            !this._cursorFixed &&
            this.maxItems() > 1;
    }

    if (this._action &&
        this._action.isFlexibleScope() &&
        isCursorMovableForAll.call(this) &&
        isChangingForAll.call(this))
    {
        this.setCursorAll(!this.cursorAll());
        this.updateCursor();
        SoundManager.playCursor();
        return true;
    }

    return false;
}

var _KMS_Window_MenuActor_processCursorMove = Window_MenuActor.prototype.processCursorMove;
Window_MenuActor.prototype.processCursorMove = function()
{
    if (processChangingForAll.call(this))
    {
        return;
    }

    _KMS_Window_MenuActor_processCursorMove.call(this);
};

/**
 * 行動オブジェクトの設定
 */
Window_MenuActor.prototype.setAction = function(action)
{
    this._action = action;
};


//-----------------------------------------------------------------------------
// Window_BattleLog

var _Window_BattleLog_startAction = Window_BattleLog.prototype.startAction;
Window_BattleLog.prototype.startAction = function(subject, action, targets)
{
    var item       = action.item();
    var originalId = item.animationId;

    if (action.isForceForAll())
    {
        var idForAll = getAnimationIdForAll(item);
        if (idForAll)
        {
            // 全体化用の戦闘アニメが存在したら差し替える
            item.animationId = idForAll;
        }
    }

    _Window_BattleLog_startAction.call(this, subject, action, targets);

    item.animationId = originalId;
};


//-----------------------------------------------------------------------------
// Window_BattleActor

var _KMS_Window_BattleActor_processCursorMove = Window_BattleActor.prototype.processCursorMove;
Window_BattleActor.prototype.processCursorMove = function()
{
    if (processChangingForAll.call(this))
    {
        if (this.cursorAll())
        {
            $gameParty.selectAllByAction(this._action);
        }
        else
        {
            $gameParty.select(this.actor());
        }
        return;
    }

    _KMS_Window_BattleActor_processCursorMove.call(this);
};

/**
 * 行動オブジェクトの設定
 */
Window_BattleActor.prototype.setAction = function(action)
{
    this._action = action;
};


//-----------------------------------------------------------------------------
// Window_BattleEnemy

var _KMS_Window_BattleEnemy_processCursorMove = Window_BattleEnemy.prototype.processCursorMove;
Window_BattleEnemy.prototype.processCursorMove = function()
{
    if (processChangingForAll.call(this))
    {
        if (this.cursorAll())
        {
            $gameTroop.selectAllByAction(this._action);
        }
        else
        {
            $gameTroop.select(this.enemy());
        }
        return;
    }

    _KMS_Window_BattleEnemy_processCursorMove.call(this);
};

/**
 * 行動オブジェクトの設定
 */
Window_BattleEnemy.prototype.setAction = function(action)
{
    this._action = action;
};


//-----------------------------------------------------------------------------
// Scene_ItemBase

var _Scene_ItemBase_determineItem = Scene_ItemBase.prototype.determineItem;
Scene_ItemBase.prototype.determineItem = function()
{
    // 全体化可否判定のためにアクションを準備
    var action = new Game_Action(this.user());
    var item = this.item();
    action.setItemObject(item);
    this._actorWindow.setAction(action);

    _Scene_ItemBase_determineItem.call(this);
};

var _Scene_ItemBase_onActorOk = Scene_ItemBase.prototype.onActorOk;
Scene_ItemBase.prototype.onActorOk = function()
{
    // 次の行動の強制全体化設定
    this.user().setNextActionForceForAll(this._actorWindow.cursorAll());

    _Scene_ItemBase_onActorOk.call(this);

    this.user().setNextActionForceForAll(false);
};


//-----------------------------------------------------------------------------
// Scene_Battle

var _Scene_Battle_selectActorSelection = Scene_Battle.prototype.selectActorSelection;
Scene_Battle.prototype.selectActorSelection = function()
{
    var action = BattleManager.inputtingAction();
    this._actorWindow.setAction(action);
    this._actorWindow.playOkSound = function() { }

    _Scene_Battle_selectActorSelection.call(this);
};

var _Scene_Battle_selectEnemySelection = Scene_Battle.prototype.selectEnemySelection;
Scene_Battle.prototype.selectEnemySelection = function()
{
    var action = BattleManager.inputtingAction();
    this._enemyWindow.setAction(action);
    this._enemyWindow.playOkSound = function() { }

    _Scene_Battle_selectEnemySelection.call(this);
};

var _Scene_Battle_onActorOk = Scene_Battle.prototype.onActorOk;
Scene_Battle.prototype.onActorOk = function()
{
    if (!this.checkForceTargetForAll(this._actorWindow))
    {
        return;
    }

    // ウィンドウの OK サウンドを消しているので鳴らす
    SoundManager.playOk();

    _Scene_Battle_onActorOk.call(this);
};

var _Scene_Battle_onEnemyOk = Scene_Battle.prototype.onEnemyOk;
Scene_Battle.prototype.onEnemyOk = function()
{
    if (!this.checkForceTargetForAll(this._enemyWindow))
    {
        return;
    }
    SoundManager.playOk();

    _Scene_Battle_onEnemyOk.call(this);
};

/**
 * 全体選択されている場合はターゲットを全体に変更する
 */
Scene_Battle.prototype.checkForceTargetForAll = function(targetWindow)
{
    if (!targetWindow.cursorAll())
    {
        return true;
    }

    // ターゲットを全体にする
    var action = BattleManager.inputtingAction();
    action.setForceForAll(true);

    // 使用可否確認
    if (!BattleManager.actor().canUse(action.item()))
    {
        // 決定をキャンセルする
        SoundManager.playBuzzer();
        targetWindow.show();
        targetWindow.activate();
        action.setForceForAll(false);
        return false;
    }

    targetWindow.setCursorAll(false);

    return true;
};

})();
