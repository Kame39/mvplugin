//=============================================================================
// KMS_SkillLevel.js
//   Last update: 2017/02/12
//=============================================================================

/*:
 * @plugindesc
 * [v0.1.0] Add the level function to skills.
 * 
 * @author TOMY (Kamesoft)
 *
 * @param Skill exp max
 * @default 100
 * @desc Maximum value of skill-exp.
 *
 * @param Enable on menu
 * @default 0
 * @desc
 *  Gain skill-exp on menu.
 *  0: Disable  1: Enable
 *
 * @param Enable for enemy
 * @default 0
 * @desc
 *  Apply skill-exp effect for enemies.
 *  0: Disable  1: Enable
 *
 * @help
 *
 * ■ Plugin commands
 *   SkillLevel gainActorSxp 1 5 100    # Add 100 skill-exp to the skill ID:5 for actor ID:1
 *   SkillLevel resetActorSxp 3         # Initialize skill-exp of skills for actor ID:3
 *   SkillLevel gainEnemySxp 0 5 100    # Add 100 skill-exp to the skill ID:5 for the head of troop
 *   SkillLevel resetEnemySxp 0         # Initialize skill-exp of skills for the head of troop
 *
 */

/*:ja
 * @plugindesc
 * [v0.1.0] スキルに熟練度の概念を追加します。
 * 
 * @author TOMY (Kamesoft)
 *
 * @param Skill exp max
 * @default 100
 * @desc 熟練度の最大値です。
 *
 * @param Enable on menu
 * @default 0
 * @desc
 *  メニューで使用したスキルに熟練度を加算するか指定します。
 *  0: 戦闘中のみ  1: メニューでも加算
 *
 * @param Enable for enemy
 * @default 0
 * @desc
 *  敵にも熟練度効果を適用します。
 *  0: OFF  1: ON
 *
 * @help
 *
 * ■ プラグインコマンド
 *   SkillLevel gainActorSxp 1 5 100    # アクター ID:1 のスキル ID:5 の熟練度を 100 加算
 *   SkillLevel resetActorSxp 3         # アクター ID:3 の熟練度を初期化
 *   SkillLevel gainEnemySxp 0 5 100    # 先頭の敵のスキル ID:5 の熟練度を 100 加算
 *   SkillLevel resetEnemySxp 0         # 先頭の敵の熟練度を初期化
 *
 */

var KMS = KMS || {};

(function() {

'use strict';

var PluginName = 'KMS_SkillLevel';

KMS.imported = KMS.imported || {};
KMS.imported['SkillLevel'] = true;

var pluginParams = PluginManager.parameters(PluginName);
var Params = {};
Params.expMax = Number(pluginParams['Skill exp max'] || 100);
Params.enableOnMenu = Number(pluginParams['Enable on menu'] || 0);
Params.enableForEnemy = Number(pluginParams['Enable for enemy'] || 0);

// 定数
var Const =
{
    debug:             false,        // デバッグモード
    defaultGainExp:    1,            // デフォルトの熟練度増加量
    pluginCommandCode: 'SkillLevel'  // プラグインコマンドコード
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
    case 'gainActorSxp':    // アクターの熟練度を増減 (actorId skillId exp)
        if (isNaN(args[1]))
        {
            console.error('[%1 %2] Invalid actor ID (%3).'.format(Const.pluginCommandCode, args[0], args[1]));
        }
        else if (isNaN(args[2]))
        {
            console.error('[%1 %2] Invalid skill ID (%3).'.format(Const.pluginCommandCode, args[0], args[2]));
        }
        else if (isNaN(args[3]))
        {
            console.error('[%1 %2] Invalid exp (%3).'.format(Const.pluginCommandCode, args[0], args[3]));
        }
        else
        {
            var actor = $gameActors.actor(parseInt(args[1]));
            actor.gainSkillExp($dataSkills[parseInt(args[2])], parseInt(args[3]));
        }
        break;

    case 'resetActorSxp':    // アクターの熟練度を初期化 (actorId)
        if (isNaN(args[1]))
        {
            console.error('[%1 %2] Invalid actor ID (%3).'.format(Const.pluginCommandCode, args[0], args[1]));
        }
        else
        {
            var actor = $gameActors.actor(parseInt(args[1]));
            actor.clearSkillExp();
        }
        break;

    case 'gainEnemySxp':    // 敵の熟練度を増減 (enemyIndex skillId exp)
        if (isNaN(args[1]))
        {
            console.error('[%1 %2] Invalid enemy index (%3).'.format(Const.pluginCommandCode, args[0], args[1]));
        }
        else if (isNaN(args[2]))
        {
            console.error('[%1 %2] Invalid skill ID (%3).'.format(Const.pluginCommandCode, args[0], args[2]));
        }
        else if (isNaN(args[3]))
        {
            console.error('[%1 %2] Invalid exp (%3).'.format(Const.pluginCommandCode, args[0], args[3]));
        }
        else
        {
            var enemy = $gameTroop.members()[parseInt(args[1])];
            if (enemy)
            {
                enemy.gainSkillExp($dataSkills[parseInt(args[2])], parseInt(args[3]));
            }
        }
        break;

    case 'resetEnemySxp':    // 敵の熟練度を初期化 (enemyIndex)
        if (isNaN(args[1]))
        {
            console.error('[%1 %2] Invalid enemy index (%3).'.format(Const.pluginCommandCode, args[0], args[1]));
        }
        else
        {
            var enemy = $gameTroop.members()[parseInt(args[1])];
            if (enemy)
            {
                enemy.clearSkillExp();
            }
        }
        break;

    default:
        // 不明なコマンド
        console.error('[%1 %2] Unknown command.'.format(Const.pluginCommandCode, args[0]));
        break;
    }
};


//-----------------------------------------------------------------------------
// Skill

/**
 * 熟練度メモの解析 : 使用時の熟練度増加量
 */
function parseSxpGainNote(skill)
{
    var note = skill.meta['kms_sxp_gain'];
    if (note == null)
    {
        return;
    }

    if (isNaN(note))
    {
        console.error('%1: Invalid exp format'.format(skill.name));
        return;
    }

    skill.expGainParam.exp = parseInt(note);
}

/**
 * 熟練度メモの解析 : 使用時の熟練度増加量 (ID 指定)
 */
function parseSxpGainIdNote(skill)
{
    var note = skill.meta['kms_sxp_gain_id'];
    if (note == null)
    {
        return;
    }

    if (isNaN(note))
    {
        console.error('%1: Invalid ID format'.format(skill.name));
        return;
    }

    skill.expGainParam.id = parseInt(note);
}

/**
 * 熟練度メモの解析 : 計算式
 */
function parseSxpFormula(skill)
{
    var parseNoteFormula = function(propertyName, note)
    {
        var formula = new Function('sxp', 'return %1'.format(note));
        this.formula[propertyName] = formula;
    };

    skill.formula = {};

    var params = ['speed', 'success'];
    params.forEach(function(param)
    {
        var note = skill.meta['kms_sxp_%1_rev'.format(param)];
        if (note)
        {
            parseNoteFormula.call(skill, param, note);
        }
    }, this);
}

/**
 * 熟練度メモの解析
 */
function parseNotesForSkillLevel(skill)
{
    if (skill == null || skill.expGainParam != null)
    {
        return;
    }

    // 初期値
    skill.expGainParam =
    {
        id:  skill.id,
        exp: Const.defaultGainExp
    };

    // メモの解析
    parseSxpGainNote(skill);
    parseSxpGainIdNote(skill);
    parseSxpFormula(skill);

    debuglog('%1: SkillId=%2, SkillExp=%3'.format(
        skill.name,
        skill.expGainParam.id,
        skill.expGainParam.exp));
    debuglog(skill.name, skill.formula);
}


//-----------------------------------------------------------------------------
// Game_Action

var _Game_Action_speed = Game_Action.prototype.speed;
Game_Action.prototype.speed = function()
{
    var speed = _Game_Action_speed.call(this);

    return speed + this.subject().getSpeedBySkillExp(this.item());
};

var _Game_Action_itemHit = Game_Action.prototype.itemHit;
Game_Action.prototype.itemHit = function(target)
{
    var hit = _Game_Action_itemHit.call(this, target);

    return hit * this.subject().getSuccessRateBySkillExp(this.item());
};

var _Game_Action_evalDamageFormula = Game_Action.prototype.evalDamageFormula;
Game_Action.prototype.evalDamageFormula = function(target)
{
    // Game_BattlerBase 内で現在の行動を参照できるようにする
    this.subject().tempCurrentAction = this;

    var value = _Game_Action_evalDamageFormula.call(this, target);

    this.subject().tempCurrentAction = undefined;

    return value;
};


//-----------------------------------------------------------------------------
// Game_BattlerBase

Object.defineProperties(Game_BattlerBase.prototype, {
    // 現在のアクションのスキル熟練度
    sxp: {
        get: function() { return this.getCurrentActionSkillExp(); },
        configurable: true
    },
    tempCurrentAction: {
        get: function() { return this._tempCurrentAction; },
        set: function(value) { this._tempCurrentAction = value; },
        configurable: true
    }
});

/**
 * 熟練度情報のクリア
 */
Game_BattlerBase.prototype.clearSkillExp = function()
{
    this._skillExp = []
};

/**
 * 現在の熟練度の取得
 */
Game_BattlerBase.prototype.getSkillExp = function(skill)
{
    if (this._skillExp == null)
    {
        this.clearSkillExp();
    }

    return this._skillExp[skill.id] || 0;
};

/**
 * 現在の熟練度の取得 (ダメージ計算式用の短縮版)
 */
Game_BattlerBase.prototype.sxpById = function(skillId)
{
    var skill = $dataSkills[skillId];
    if (skill)
    {
        return this.getSkillExp(skill);
    }
    else
    {
        console.error('Invalid skill ID (%1)'.format(skillId));
        return 0;
    }
};

/**
 * 現在のアクションの熟練度を取得
 */
Game_BattlerBase.prototype.getCurrentActionSkillExp = function()
{
    var action = this.tempCurrentAction;
    if (action && action.isSkill())
    {
        var skill = action.item();
        debuglog('[%1] CurrentActionSxp: %2'.format(this.name(), this.getSkillExp(skill)));
        return this.getSkillExp(skill);
    }
    else
    {
        return 0;
    }
};

/**
 * 熟練度の取得
 */
Game_BattlerBase.prototype.gainSkillExp = function(skill, amount)
{
    if (this._skillExp == null)
    {
        this.clearSkillExp();
    }

    this._skillExp[skill.id] =
       (this.getSkillExp(skill) + amount).clamp(0, Params.expMax);
};

/**
 * 熟練度の取得が可能なスキルか判定
 */
Game_BattlerBase.prototype.canGainSkillExp = function(skill)
{
    return DataManager.isSkill(skill) &&
        skill.id !== this.attackSkillId() &&
        skill.id !== this.guardSkillId();
};

/**
 * 熟練度増減効果の適用
 */
Game_BattlerBase.prototype.gainSkillExpEffect = function(skill)
{
    if (!this.canGainSkillExp(skill))
    {
        return;
    }

    parseNotesForSkillLevel(skill);

    var param = skill.expGainParam;
    this.gainSkillExp($dataSkills[param.id], param.exp);
};

/**
 * 熟練度による速度補正の取得
 */
Game_BattlerBase.prototype.getSpeedBySkillExp = function(skill)
{
    parseNotesForSkillLevel(skill);

    var formula = skill.formula.speed
    if (formula)
    {
        var speed = formula(this.getSkillExp(skill));
        debuglog('[%1] Speed: %2'.format(this.name(), speed));
        return speed;
    }
    else
    {
        return 0;
    }
};

/**
 * 熟練度による成功率補正の取得
 */
Game_BattlerBase.prototype.getSuccessRateBySkillExp = function(skill)
{
    parseNotesForSkillLevel(skill);

    var formula = skill.formula.success
    if (formula)
    {
        var rate = Math.max(formula(this.getSkillExp(skill)), 0);
        debuglog('[%1] Success: %2'.format(this.name(), rate));
        return rate;
    }
    else
    {
        return 1;
    }
};


//-----------------------------------------------------------------------------
// Game_Battler

var _Game_Battler_useItem = Game_Battler.prototype.useItem;
Game_Battler.prototype.useItem = function(item)
{
    _Game_Battler_useItem.call(this, item);

    if ($gameParty.inBattle() || Params.enableOnMenu)
    {
        this.gainSkillExpEffect(item);
    }
};


//-----------------------------------------------------------------------------
// Game_Enemy

if (!Params.enableForEnemy)
{

    Game_Enemy.prototype.getSkillExp = function(skill)
    {
        return 0;
    };

    Game_Enemy.prototype.gainSkillExp = function(skill, amount)
    {
        // 何もしない
    };

}


//-----------------------------------------------------------------------------
// Window_Base

var _Window_Base_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
Window_Base.prototype.convertEscapeCharacters = function(text)
{
    var text = _Window_Base_convertEscapeCharacters.call(this, text);

    text = text.replace(/\x1b_?SXP\[(\d+)\s*,\s*(\d+)\]/gi, function()
    {
        if (isNaN(arguments[1]) || isNaN(arguments[2]))
        {
            return '';
        }

        var actor = $gameActors.actor(parseInt(arguments[1]));
        var skill = $dataSkills[parseInt(arguments[2])];
        return actor.getSkillExp(skill);
    }.bind(this));

    return text;
};


//-----------------------------------------------------------------------------
// Window_Help

var _Window_Help_convertEscapeCharacters = Window_Help.prototype.convertEscapeCharacters;
Window_Help.prototype.convertEscapeCharacters = function(text)
{
    var text = _Window_Help_convertEscapeCharacters.call(this, text);

    text = text.replace(/\x1b_?SXP\[(\d+)\]/gi, function()
    {
        if (!this._actor || isNaN(arguments[1]))
        {
            return '';
        }

        var skill = $dataSkills[parseInt(arguments[1])];
        return this._actor.getSkillExp(skill);
    }.bind(this));

    text = text.replace(/\x1b_?SXP/gi, function()
    {
        if (!this._actor || !this._item)
        {
            return '';
        }

        return this._actor.getSkillExp(this._item);
    }.bind(this));

    return text;
};

var _Window_Help_clear = Window_Help.prototype.clear;
Window_Help.prototype.clear = function()
{
    this._actor = null;
    this._item  = null;

    _Window_Help_clear.call(this);
};

var _Window_Help_setItem = Window_Help.prototype.setItem;
Window_Help.prototype.setItem = function(item)
{
    this._item = item;

    _Window_Help_setItem.call(this, item);
};

/**
 * アクターの設定
 */
Window_Help.prototype.setActor = function(actor)
{
    this._actor = actor;
};


//-----------------------------------------------------------------------------
// Window_SkillList

var _Window_SkillList_setActor = Window_SkillList.prototype.setActor;
Window_SkillList.prototype.setActor = function(actor)
{
    // 同じスキルが選択されたときに適切な熟練度を表示するため、一旦内容を初期化
    if (this._actor !== actor)
    {
        this.setHelpWindowItem(null);
    }

    _Window_SkillList_setActor.call(this, actor);
};

var _Window_SkillList_updateHelp = Window_SkillList.prototype.updateHelp;
Window_SkillList.prototype.updateHelp = function(item)
{
    // ヘルプテキスト解析のためにアクターをセット
    if (this._helpWindow)
    {
        this._helpWindow.setActor(this._actor);
    }

    _Window_SkillList_updateHelp.call(this, item);

    if (this._helpWindow)
    {
        this._helpWindow.setActor(null);
    }
};


//-----------------------------------------------------------------------------
// Window_BattleSkill

var _Window_BattleSkill_hide = Window_BattleSkill.prototype.hide;
Window_BattleSkill.prototype.hide = function()
{
    _Window_BattleSkill_hide.call(this);

    // 同じスキルが選択されたときに適切な熟練度を表示するため、一旦内容を初期化
    if (this._helpWindow)
    {
        this._helpWindow.setItem(null);
    }
};


//-----------------------------------------------------------------------------
// Scene_Skill

var _Scene_Skill_useItem = Scene_Skill.prototype.useItem;
Scene_Skill.prototype.useItem = function()
{
    _Scene_Skill_useItem.call(this);

    // 熟練度の変化を再描画
    this._helpWindow.setActor(this.actor());
    this._helpWindow.refresh();
    this._helpWindow.setActor(null);
};

})();
