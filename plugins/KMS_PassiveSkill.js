//=============================================================================
// KMS_PassiveSkill.js
//   Last update: 2016/06/12
//=============================================================================

/*:
 * @plugindesc
 * [v0.2.0] Creates skill which add effects all the time.
 * 
 * @author TOMY (Kamesoft)
 *
 * @help This plugin does not provide plugin commands.
 *
 * ## Format
 *   <kms_passive: parameters>
 *
 * Parameters can be specified with multiple definitions
 * separated by ',' or newline.
 *
 * ## Gain base parameters
 *   ParameterName +n
 *   ParameterName -n
 *   ParameterName +n%
 *   ParameterName -n%
 *
 * Usable parameters:
 *  MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK,
 *  HIT, EVA, CRI, CEV, MEV, MRF, CNT, HRG, MRG, TRG,
 *  TGR, GRD, REC, PHA, MCR, TCR, PDR, MDR, FDR, EXR
 *
 * ## Resistance
 *   RATE element ElementID rate%
 *   RATE state StateID rate%
 *   RATE debuff Parameter rate%
 *   RESIST state StateIDs
 *
 * It's described by the magnification, so weak point is +, tolerant is -.
 * RESIST state can be specified with multiple IDs separated by the space.
 * Following parameters can be described in Parameter for debuff:
 *  MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK
 *
 * ## Attack effect
 *   ATTACK element ElementIDs
 *   ATTACK state StateID:rate%
 *
 * These can be specified with multiple IDs (and rate) separated by the space.
 *
 * ## Skill type
 *   SKILLTYPE add SkillTypeIDs
 *   SKILLTYPE seal SkillTypeIDs
 *
 * These can be specified with multiple IDs separated by the space.
 *
 * ## Equip type
 *   EQUIPTYPE weapon WeaponTypeIDs
 *   EQUIPTYPE armor ArmorTypeIDs
 *   EQUIPTYPE lock EquipTypeIDs
 *   EQUIPTYPE seal EquipTypeIDs
 *
 * These can be specified with multiple IDs separated by the space.
 *
 * ## Party ability
 *   PABILITY AbilityName
 *
 * Following abilities can be described in AbilityName:
 *  encounter_half, encounter_none, cancel_surprise,
 *  raise_preemptive, gold_double, drop_item_double
 *
 * ## Example
 *   <kms_passive: MHP +30%, ATK +10%,
 *   HRG +2%, EXR +20%,
 *   RATE element 9 +30%, RATE element 4 -80%,
 *   RATE state 6 +20%, RATE state 10 -50%,
 *   RATE debuff MHP -50%, RESIST state 1 4 8,
 *   ATTACK element 2 7,
 *   ATTACK state 4:50% 5:100%,
 *   PABILITY gold_double >
 */

/*:ja
 * @plugindesc
 * [v0.2.0] 習得すると常に効果を発揮するスキルを作成します。
 * 
 * @author TOMY (Kamesoft)
 *
 * @help このプラグインには、プラグインコマンドはありません。
 *
 * ■ 書式
 *   <kms_passive: パラメータ>
 *
 * パラメータは , または改行で区切って複数指定可能。
 *
 * ■ 能力変化
 *   パラメータ名 +n
 *   パラメータ名 -n
 *   パラメータ名 +n%
 *   パラメータ名 -n%
 *
 * パラメータ名は以下を指定可能。
 *  MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK,
 *  HIT, EVA, CRI, CEV, MEV, MRF, CNT, HRG, MRG, TRG,
 *  TGR, GRD, REC, PHA, MCR, TCR, PDR, MDR, FDR, EXR
 *
 * ■ 耐性
 *   RATE element 属性ID 倍率
 *   RATE state ステートID 付与率
 *   RATE debuff パラメータ 付与率
 *   RESIST state ステートID
 *
 * 倍率のため、弱点の場合は +、耐性の場合は - を指定。
 * RESIST state の ID は空白で区切って複数指定可能。
 * debuff のパラメータは下記を指定可能。
 *  MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK
 *
 * ■ 攻撃効果
 *   ATTACK element 属性ID
 *   ATTACK state ステートID:付与率
 *
 * ID (と付与率) は空白で区切って複数指定可能。
 *
 * ■ スキルタイプ
 *   SKILLTYPE add 追加するスキルタイプID
 *   SKILLTYPE seal 封印するスキルタイプID
 *
 * ID は空白で区切って複数指定可能。
 *
 * ■ 装備タイプ
 *   EQUIPTYPE weapon 追加する武器タイプID
 *   EQUIPTYPE armor 追加する防具タイプID
 *   EQUIPTYPE lock ロックする装備タイプID
 *   EQUIPTYPE seal 封印する装備タイプID
 *
 * ID は空白で区切って複数指定可能。
 *
 * ■ パーティ能力
 *   PABILITY 能力名
 *
 * 能力には以下を指定可能。
 *  encounter_half, encounter_none, cancel_surprise,
 *  raise_preemptive, gold_double, drop_item_double
 *
 * ■ 例
 *   <kms_passive: MHP +30%, ATK +10%,
 *   HRG +2%, EXR +20%,
 *   RATE element 9 +30%, RATE element 4 -80%,
 *   RATE state 6 +20%, RATE state 10 -50%,
 *   RATE debuff MHP -50%, RESIST state 1 4 8,
 *   ATTACK element 2 7,
 *   ATTACK state 4:50% 5:100%,
 *   PABILITY gold_double >
 */

var KMS = KMS || {};

(function() {

'use strict';

KMS.imported = KMS.imported || {};
KMS.imported['PassiveSkill'] = true;

//var pluginParams = PluginManager.parameters('KMS_PassiveSkill');
var Params = {};

//Params._debugMode = true;

// パラメータ名とパラメータ ID の対応
var ParameterIds =
{
    mhp: 0, mmp: 1, atk: 2, def: 3, mat: 4, mdf: 5, agi: 6, luk: 7
};

var XParameterIds =
{
    hit: 0, eva: 1, cri: 2, cev: 3, mev: 4, mrf: 5, cnt: 6, hrg: 7, mrg: 8, trg: 9
};

var SParameterIds =
{
    tgr: 0, grd: 1, rec: 2, pha: 3, mcr: 4, tcr: 5, pdr: 6, mdr: 7, fdr: 8, exr: 9
};

var PartyAbilities =
{
    encounter_half:   Game_Party.ABILITY_ENCOUNTER_HALF,
    encounter_none:   Game_Party.ABILITY_ENCOUNTER_NONE,
    cancel_surprise:  Game_Party.ABILITY_CANCEL_SURPRISE,
    raise_preemptive: Game_Party.ABILITY_RAISE_PREEMPTIVE,
    gold_double:      Game_Party.ABILITY_GOLD_DOUBLE,
    drop_item_double: Game_Party.ABILITY_DROP_ITEM_DOUBLE
};

// パッシブスキルパラメータ解析式
// % 指定と即値指定に対応。
// <例>
//  <kms_passive: MHP +100>  # 最大 HP +100
//  <kms_passive: MMP -5%>   # 最大 MP -5%
//  <kms_passive: ATK +10%>  # ATK +10%
var PassiveParamRegExp =
    /(\w+)\s*\+?(\-?\d+)([%％])?/i;

// パッシブスキル耐性解析式
// % の有無は無視して全て割合指定扱い。
// ダメージ/付与率指定なので、+ が弱点、- が強化になる。
// <例>
//  <kms_passive: RATE element 10 +50%>  # 属性 10 の倍率 +50% (弱点)
//  <kms_passive: RATE state 5 -20%>     # ステート 5 の耐性 -20% (強化)
//  <kms_passive: RATE debuff MHP +30%>    # 最大 HP デバフ発生率 +30% (弱点)
var PassiveResistRateRegExp =
    /RATE\s+(ELEMENT|DEBUFF|STATE)\s*(\d+|\w+)\s*\+?(\-?\d+)([%％])?/i;

// パッシブスキル耐性解析式
// 空白で区切って複数指定可能。
// <例>
//  <kms_passive: RESIST state 5>      # ステート 5 を無効化
//  <kms_passive: RESIST state 1 2 3>  # ステート 1, 2, 3 を無効化
var PassiveInvalidRegExp =
    /RESIST\s+(STATE)\s*(\d+(?:\s+\d+)*)/i;

// 攻撃属性・ステート解析式
// 空白で区切って複数指定可能。
// <例>
//  <kms_passive: ATTACK element 3 4>        # 攻撃属性に 3, 4 を付与
//  <kms_passive: ATTACK state 4+20% 5+10%>  # 攻撃時にステート 4 を 20%, ステート 5 を 10 % の確率で付与
var PassiveAttackRegExp;
(function()
{
    var valueRegExp = '\\d+(?:\\s*:\\s*\\d+[%％]?)?';
    PassiveAttackRegExp = new RegExp(
        'ATTACK\\s+(ELEMENT|STATE)\\s*('
            + valueRegExp
            + '(?:\\s+'
            + valueRegExp
            + ')*)',
        'i');
})();

// スキルタイプ解析式
// 空白で区切って複数指定可能。
// <例>
//  <kms_passive: SKILLTYPE add 1 2>  # スキルタイプ 1, 2 を追加
//  <kms_passive: SKILLTYPE seal 3>   # スキルタイプ 3 を封印
var PassiveSkillTypeRegExp =
    /SKILLTYPE\s+(ADD|SEAL)\s*(\d+(?:\s+\d+)*)/i;

// 装備タイプ解析式
// 空白で区切って複数指定可能。
// <例>
//  <kms_passive: EQUIPTYPE weapon 1 2>  # 武器タイプ 1, 2 を装備可能
//  <kms_passive: EQUIPTYPE armor 3>     # 防具タイプ 3 を装備可能
//  <kms_passive: EQUIPTYPE lock 2>      # 装備タイプ 2 をロック
//  <kms_passive: EQUIPTYPE seal 4>      # 装備タイプ 4 を封印
var PassiveEquipTypeRegExp =
    /EQUIPTYPE\s+(WEAPON|ARMOR|LOCK|SEAL)\s*(\d+(?:\s+\d+)*)/i;

// パーティアビリティ解析式
// <例>
//  <kms_passive: PABILITY encounter_half>  # エンカウント率半減
var PassivePartyAbilityRegExp = /PABILITY\s+(\w+)/i;


//-----------------------------------------------------------------------------

// トルコロケールで i の小文字変換が期待と異なる件に対する W/A
var toLower = function(s) { return s.toLowerCase(); };

if ('i' !== 'I'.toLowerCase())
{
    // トルコ用
    toLower = function(s) { return s.replace(/[A-Z]/g, function(ch) { return String.fromCharCode(ch.charCodeAt(0) | 32); }); };
}

/**
 * 空のパッシブスキルパラメータ補正を作成
 */
function createEmptyPassiveSkillParameters()
{
    var paramsPlus = { param: [], xparam: [], sparam: [] };
    var paramsRate = { param: [], xparam: [], sparam: [] };
    var resist     = { element: [], state: [], debuff: [] };
    var invalid    = { state: [] };
    var attack     = { element: [], state: [] };
    var skillType  = { add: [], seal: [] };
    var equipType  = { weapon: [], armor: [], lock: [], seal: [] };
    var ability    = { party: [] };

    function init(param, ids)
    {
        for (var key in ids)
        {
            var id = ids[key];
            paramsPlus[param][id] = 0;
            paramsRate[param][id] = 1.0;
        }
    }

    init('param',  ParameterIds);
    init('xparam', XParameterIds);
    init('sparam', SParameterIds);

    for (var i = 0; i < $dataSystem.elements.length; i++)
    {
        resist.element[i] = 1.0;
    }

    for (var i = 0; i < $dataStates.length; i++)
    {
        resist.state[i] = 1.0;
    }

    for (var key in ParameterIds)
    {
        var id = ParameterIds[key];
        resist.debuff[id] = 1.0;
    }

    return {
        plus: paramsPlus,
        rate: paramsRate,
        resist: resist,
        invalid: invalid,
        attack: attack,
        skillType: skillType,
        equipType: equipType,
        ability: ability
    };
}

/**
 * パッシブスキルパラメータの解析
 */
function parsePassiveSkillParameters(skill)
{
    if (skill.kmsPassiveParams != null)
    {
        // 解析済み
        return;
    }

    // パラメータ補正の初期化
    skill.kmsPassiveParams = createEmptyPassiveSkillParameters();

    if (skill.meta.kms_passive == null)
    {
        // パッシブスキルパラメータなし
        return;
    }

    // ',' または改行で分割
    var params = skill.meta.kms_passive.split(/\s*[,\n]\s*/);

    // 正規表現と解析関数の対応表
    var parseFunctionList =
    [
        { reg: PassiveResistRateRegExp,   func: parsePassiveSkillResistanceRate },
        { reg: PassiveInvalidRegExp,      func: parsePassiveSkillInvalid },
        { reg: PassiveAttackRegExp,       func: parsePassiveSkillAttack },
        { reg: PassiveSkillTypeRegExp,    func: parsePassiveSkillSkillType },
        { reg: PassiveEquipTypeRegExp,    func: parsePassiveSkillEquipType },
        { reg: PassivePartyAbilityRegExp, func: parsePassiveSkillPartyAbility },
        { reg: PassiveParamRegExp,        func: parsePassiveSkillNormalParams }
    ];

    // 各パラメータの解析
    for (var i = 0; i < params.length; i++)
    {
        for (var j = 0; j < parseFunctionList.length; j++)
        {
            var item = parseFunctionList[j];
            var match = params[i].match(item.reg);
            if (match)
            {
                item.func(skill.kmsPassiveParams, match);
                break;
            }
        }
    }

    if (Params._debugMode)
    {
        console.log(skill.kmsPassiveParams);
    }
}

/**
 * 通常パラメータ指定の解析
 */
function parsePassiveSkillNormalParams(paramObject, match)
{
    var paramName  = toLower(match[1]);
    var paramValue = parseInt(match[2], 10);

    // param, xparam, sparam の各々に合わせた動作
    var idList    = null;
    var paramType = null;
    var isPlus    = false;
    if (ParameterIds[paramName] != null)
    {
        idList    = ParameterIds;
        paramType = 'param';

        // % が付いている場合は割合乗算、無ければ即値
        isPlus = (match[3] == null);
        if (!isPlus)
        {
            paramValue = 1.0 + paramValue / 100.0;
        }
    }
    else if (XParameterIds[paramName] != null)
    {
        idList    = XParameterIds;
        paramType = 'xparam';

        // xparam は割合加算
        isPlus      = true;
        paramValue /= 100.0;
    }
    else if (SParameterIds[paramName] != null)
    {
        idList    = SParameterIds;
        paramType = 'sparam';

        // xparam は割合乗算
        isPlus     = false;
        paramValue = 1.0 + paramValue / 100.0;
    }
    else
    {
        // 存在しないパラメータ
        return;
    }

    var passiveParams = isPlus ? paramObject.plus : paramObject.rate;

    // パラメータ補正値の加算
    var id = idList[paramName];
    if (isPlus)
    {
        passiveParams[paramType][id] += paramValue;
    }
    else
    {
        passiveParams[paramType][id] *= paramValue;
    }
}

/**
 * 耐性割合指定の解析
 */
function parsePassiveSkillResistanceRate(paramObject, match)
{
    var name  = toLower(match[1]);

    var paramList = paramObject.resist[name];
    if (paramList == null)
    {
        // 不正なパラメータ名
        return;
    }

    var id = parseInt(match[2], 10);
    if (isNaN(id))
    {
        // debuff の場合は基本パラメータ名指定の場合がある
        id = ParameterIds[toLower(match[2])];
    }

    if (id == null)
    {
        // 不正なパラメータ指定
        return;
    }

    if (paramList[id] == null)
    {
        // 範囲外の ID
        return;
    }

    // 常に割合指定
    var value = parseInt(match[3], 10);
    paramList[id] *= 1.0 + value / 100.0;

    if (Params._debugMode)
    {
        console.log('Resist: ' + name, paramList);
    }
}

/**
 * 無効化指定の解析
 */
function parsePassiveSkillInvalid(paramObject, match)
{
    var name = toLower(match[1]);

    var paramList = paramObject.invalid[name];
    if (paramList == null)
    {
        // 不正なパラメータ名
        return;
    }

    var ids = match[2].split(/\s+/);

    for (var i = 0; i < ids.length; i++)
    {
        paramList.push(parseInt(ids[i], 10));
    }
}

/**
 * 攻撃属性・ステート指定の解析
 */
function parsePassiveSkillAttack(paramObject, match)
{
    var name = toLower(match[1]);

    var paramList = paramObject.attack[name];
    if (paramList == null)
    {
        // 不正なパラメータ名
        return;
    }

    var values = match[2].split(/\s+/);

    for (var i = 0; i < values.length; i++)
    {
        if (name === 'state')
        {
            // ID:付与率 形式の判定
            var valueMatch = values[i].match(/(\d+)\s*:\s*(\d+)[%％]/);
            if (!valueMatch)
            {
                continue;
            }

            paramList.push({
                id: parseInt(valueMatch[1], 10),
                rate: parseInt(valueMatch[2], 10) / 100.0
            });
        }
        else
        {
            paramList.push(parseInt(values[i], 10));
        }
    }

    if (Params._debugMode)
    {
        console.log('Attack: ' + name, paramList);
    }
}

/**
 * スキルタイプ指定の解析
 */
function parsePassiveSkillSkillType(paramObject, match)
{
    var name = toLower(match[1]);

    var paramList = paramObject.skillType[name];
    if (paramList == null)
    {
        // 不正なパラメータ名
        return;
    }

    var ids = match[2].split(/\s+/);
    for (var i = 0; i < ids.length; i++)
    {
        paramList.push(parseInt(ids[i], 10));
    }
}

/**
 * 装備タイプ指定の解析
 */
function parsePassiveSkillEquipType(paramObject, match)
{
    var name = toLower(match[1]);

    var paramList = paramObject.equipType[name];
    if (paramList == null)
    {
        // 不正なパラメータ名
        return;
    }

    var ids = match[2].split(/\s+/);
    for (var i = 0; i < ids.length; i++)
    {
        paramList.push(parseInt(ids[i], 10));
    }
}

/**
 * パーティアビリティ指定の解析
 */
function parsePassiveSkillPartyAbility(paramObject, match)
{
    var name = toLower(match[1]);

    var id = PartyAbilities[name];
    if (id == null)
    {
        // 不正なアビリティ名
        return;
    }

    var paramList = paramObject.ability.party;
    if (!paramList.contains(id))
    {
        paramList.push(id);
    }

    if (Params._debugMode)
    {
        console.log('PartyAbility: ' + name, paramList);
    }
}

/**
 * パッシブスキルパラメータの適用
 */
function applyPassiveSkillParameters(lhs, rhs)
{
    function applyParam(paramName, ids)
    {
        for (var key in ids)
        {
            var id = ids[key];
            lhs.plus[paramName][id] += rhs.plus[paramName][id];
            lhs.rate[paramName][id] *= rhs.rate[paramName][id];
        }
    }

    function applyResist(paramName, idMax)
    {
        for (var i = 0; i < idMax; i++)
        {
            lhs.resist[paramName][i] *= rhs.resist[paramName][i];
        }
    }

    function applyDebuffResist(paramName, ids)
    {
        for (var key in ids)
        {
            var id = ids[key];
            lhs.resist[paramName][id] *= rhs.resist[paramName][id];
        }
    }

    function applyList(name1, name2)
    {
        lhs[name1][name2] = lhs[name1][name2].concat(rhs[name1][name2]);
    }

    applyParam('param',  ParameterIds);
    applyParam('xparam', XParameterIds);
    applyParam('sparam', SParameterIds);

    applyResist('element', $dataSystem.elements.length);
    applyResist('state',   $dataStates.length);

    applyDebuffResist('debuff', ParameterIds);

    applyList('invalid',   'state');
    applyList('attack',    'element');
    applyList('attack',    'state');
    applyList('skillType', 'add');
    applyList('skillType', 'seal');
    applyList('equipType', 'weapon');
    applyList('equipType', 'armor');
    applyList('equipType', 'seal');
    applyList('equipType', 'lock');
    applyList('ability',   'party');
}


//-----------------------------------------------------------------------------
// DataManager

var _KMS_DataManager_saveGameWithoutRescue = DataManager.saveGameWithoutRescue;
DataManager.saveGameWithoutRescue = function(savefileId)
{
    // セーブ前にパーティメンバーのパッシブスキルキャッシュを無効化
    $gameParty.invalidatePassiveSkillCache();

    return _KMS_DataManager_saveGameWithoutRescue.call(this, savefileId);
};


//-----------------------------------------------------------------------------
// Game_Actor

var _KMS_Game_Actor_initSkills = Game_Actor.prototype.initSkills;
Game_Actor.prototype.initSkills = function()
{
    _KMS_Game_Actor_initSkills.call(this);

    this.invalidatePassiveSkillCache();
};

var _KMS_Game_Actor_learnSkill = Game_Actor.prototype.learnSkill;
Game_Actor.prototype.learnSkill = function(skillId)
{
    _KMS_Game_Actor_learnSkill.call(this, skillId);

    this.invalidatePassiveSkillCache();
};

var _KMS_Game_Actor_forgetSkill = Game_Actor.prototype.forgetSkill;
Game_Actor.prototype.forgetSkill = function(skillId)
{
    _KMS_Game_Actor_forgetSkill.call(this, skillId);

    this.invalidatePassiveSkillCache();
};

var _KMS_Game_Actor_paramPlus = Game_Actor.prototype.paramPlus;
Game_Actor.prototype.paramPlus = function(paramId)
{
    var value = _KMS_Game_Actor_paramPlus.call(this, paramId);

    var params = this.getPassiveSkillParams();
    return value + params.plus.param[paramId];
};

var _KMS_Game_Actor_paramRate = Game_Actor.prototype.paramRate;
Game_Actor.prototype.paramRate = function(paramId)
{
    var value = _KMS_Game_Actor_paramRate.call(this, paramId);

    var params = this.getPassiveSkillParams();
    return value * params.rate.param[paramId];
};

var _KMS_Game_Actor_xparam = Game_Actor.prototype.xparam;
Game_Actor.prototype.xparam = function(xparamId)
{
    var value = _KMS_Game_Actor_xparam.call(this, xparamId);
    
    var params = this.getPassiveSkillParams();
    return value + params.plus.xparam[xparamId];
};

var _KMS_Game_Actor_sparam = Game_Actor.prototype.sparam;
Game_Actor.prototype.sparam = function(sparamId)
{
    var value = _KMS_Game_Actor_sparam.call(this, sparamId);

    var params = this.getPassiveSkillParams();
    return value * params.rate.sparam[sparamId];
};

var _KMS_Game_Actor_elementRate = Game_Actor.prototype.elementRate;
Game_Actor.prototype.elementRate = function(elementId)
{
    var value = _KMS_Game_Actor_elementRate.call(this, elementId);

    var params = this.getPassiveSkillParams();
    return value * params.resist.element[elementId];
};

var _KMS_Game_Actor_debuffRate = Game_Actor.prototype.debuffRate;
Game_Actor.prototype.debuffRate = function(paramId)
{
    var value = _KMS_Game_Actor_debuffRate.call(this, paramId);

    var params = this.getPassiveSkillParams();
    return value * params.resist.debuff[paramId];
};

var _KMS_Game_Actor_stateRate = Game_Actor.prototype.stateRate;
Game_Actor.prototype.stateRate = function(stateId)
{
    var value = _KMS_Game_Actor_stateRate.call(this, stateId);

    var params = this.getPassiveSkillParams();
    return value * params.resist.state[stateId];
};

var _KMS_Game_Actor_stateResistSet = Game_Actor.prototype.stateResistSet;
Game_Actor.prototype.stateResistSet = function()
{
    var list = _KMS_Game_Actor_stateResistSet.call(this);

    var params = this.getPassiveSkillParams();
    return list.concat(params.invalid.state);
};

var _KMS_Game_Actor_attackElement = Game_Actor.prototype.attackElements;
Game_Actor.prototype.attackElements = function()
{
    var list = _KMS_Game_Actor_attackElement.call(this);

    var params = this.getPassiveSkillParams();
    return list.concat(params.attack.element);
};

var _KMS_Game_Actor_attackStates = Game_Actor.prototype.attackStates;
Game_Actor.prototype.attackStates = function()
{
    var list = _KMS_Game_Actor_attackStates.call(this);

    var params = this.getPassiveSkillParams();
    var states = params.attack.state;
    for (var i = 0; i < states.length; i++)
    {
        if (!list.contains(states[i].id))
        {
            list.push(states[i].id);
        }
    }

    return list;
};

var _KMS_Game_Actor_attackStatesRate = Game_Actor.prototype.attackStatesRate;
Game_Actor.prototype.attackStatesRate = function(stateId)
{
    var value = _KMS_Game_Actor_attackStatesRate.call(this, stateId);

    var params = this.getPassiveSkillParams();
    var states = params.attack.state;
    for (var i = 0; i < states.length; i++)
    {
        if (states[i].id === stateId)
        {
            value += states[i].rate;
        }
    }

    return value;
};

// 追加スキルタイプ
var _KMS_Game_Actor_addedSkillTypes = Game_Actor.prototype.addedSkillTypes;
Game_Actor.prototype.addedSkillTypes = function()
{
    var list = _KMS_Game_Actor_addedSkillTypes.call(this);

    var params = this.getPassiveSkillParams();
    return list.concat(params.skillType.add);
};

// スキルタイプ封印
var _KMS_Game_Actor_isSkillTypeSealed = Game_Actor.prototype.isSkillTypeSealed;
Game_Actor.prototype.isSkillTypeSealed = function(stypeId)
{
    var result = _KMS_Game_Actor_isSkillTypeSealed.call(this, stypeId);

    return result || this.getPassiveSkillParams().skillType.add.contains(stypeId);
};

// 装備可能武器タイプ
var _KMS_Game_Actor_isEquipWtypeOk = Game_Actor.prototype.isEquipWtypeOk;
Game_Actor.prototype.isEquipWtypeOk = function(wtypeId)
{
    var result = _KMS_Game_Actor_isEquipWtypeOk.call(this, wtypeId);

    return result || this.getPassiveSkillParams().equipType.weapon.contains(wtypeId);
};

// 装備可能防具タイプ
var _KMS_Game_Actor_isEquipAtypeOk = Game_Actor.prototype.isEquipAtypeOk;
Game_Actor.prototype.isEquipAtypeOk = function(atypeId)
{
    var result = _KMS_Game_Actor_isEquipAtypeOk.call(this, atypeId);

    return result || this.getPassiveSkillParams().equipType.armor.contains(atypeId);
};

// 装備タイプロック
var _KMS_Game_Actor_isEquipTypeLocked = Game_Actor.prototype.isEquipTypeLocked;
Game_Actor.prototype.isEquipTypeLocked = function(etypeId)
{
    var result = _KMS_Game_Actor_isEquipTypeLocked.call(this, etypeId);

    return result || this.getPassiveSkillParams().equipType.lock.contains(etypeId);
};

// 装備タイプ封印
var _KMS_Game_Actor_isEquipTypeSealed = Game_Actor.prototype.isEquipTypeSealed;
Game_Actor.prototype.isEquipTypeSealed = function(etypeId)
{
    var result = _KMS_Game_Actor_isEquipTypeSealed.call(this, etypeId);

    return result || this.getPassiveSkillParams().equipType.seal.contains(etypeId);
};

// パーティ能力
var _KMS_Game_Actor_partyAbility = Game_Actor.prototype.partyAbility;
Game_Actor.prototype.partyAbility = function(abilityId)
{
    var result = _KMS_Game_Actor_partyAbility.call(this, abilityId);

    return result || this.getPassiveSkillParams().ability.party.contains(abilityId);
};

/**
 * パッシブスキルのキャッシュが有効か
 */
Game_Actor.prototype.isValidPassiveSkillCache = function()
{
    return this._kmsPassiveParamsCache != null;
};

/**
 * パッシブスキルのキャッシュを無効化
 */
Game_Actor.prototype.invalidatePassiveSkillCache = function()
{
    this._kmsPassiveParamsCache = null;
};

/**
 * パッシブスキルのキャッシュを更新
 */
Game_Actor.prototype.updatePassiveCache = function()
{
    var cache = createEmptyPassiveSkillParameters();

    var skills = this.skills();
    for (var i = 0; i < skills.length; i++)
    {
        parsePassiveSkillParameters(skills[i]);
        applyPassiveSkillParameters(cache, skills[i].kmsPassiveParams);
    }

    this._kmsPassiveParamsCache = cache;
};

/**
 * パッシブスキルによる補正値を取得
 */
Game_Actor.prototype.getPassiveSkillParams = function()
{
    if (!this.isValidPassiveSkillCache())
    {
        this.updatePassiveCache();
        this.refresh();
    }
    
    return this._kmsPassiveParamsCache;
};


//-----------------------------------------------------------------------------
// Game_Party

/**
 * メンバーのパッシブスキルキャッシュを無効化
 */
Game_Party.prototype.invalidatePassiveSkillCache = function()
{
    this.allMembers().forEach(function(actor)
    {
        actor.invalidatePassiveSkillCache();
    }, this);
};

var _KMS_Game_Party_addActor = Game_Party.prototype.addActor;
Game_Party.prototype.addActor = function(actorId)
{
    _KMS_Game_Party_addActor.call(this, actorId);

    // 加入したアクターのパッシブスキルキャッシュを無効化
    $gameActors.actor(actorId).invalidatePassiveSkillCache();
};

})();
