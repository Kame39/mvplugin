//=============================================================================
// KMS_AbilityOrb.js
//   Last update: 2016/07/10
//=============================================================================

/*:
 * @plugindesc
 * [v0.1.0] Implements the ability orb function. (It's similar to materia system in FF7)
 *
 * @author TOMY (Kamesoft)
 *
 * @param Orb name
 * @default Orb
 * @desc Name for "ability orb".
 *
 * @param AP caption
 * @default AP
 * @desc Caption for AP.
 *
 * @param Command name
 * @default Ability orb
 * @desc Command name for menu command list.
 *
 * @param Sort command name
 * @default Sort
 * @desc Command name for sorting orbs.
 *
 * @param Sort condition: category
 * @default Category
 * @desc Notation for sorting orbs by their category.
 *
 * @param Sort condition: name
 * @default Name
 * @desc Notation for sorting orbs by their name.
 *
 * @param Skill list name
 * @default Skill list
 * @desc Caption for learnable skill list.
 *
 * @param Effect list name
 * @default Equipment effects
 * @desc Caption for equipment effects.
 *
 * @param Pair effect: element
 * @default Element effect
 * @desc Paired effect name for element.
 *
 * @param Pair effect: state
 * @default State effect
 * @desc Paired effect name for state.
 *
 * @param Pair effect: flexible scope
 * @default Flexible scope
 * @desc Paired effect name for flexible scope.
 *
 * @param Obtain AP message
 * @default %1 %2 received!
 * @desc Battle result message for obtain AP.
 *
 * @param Level up message
 * @default %1's %2 "%3" is now %4 %5!
 * @desc Level up message for an orb.
 *
 * @param Increase message
 * @default %1 "%2" increased!
 * @desc The message when an orb increased.
 *
 * @param Empty slot icon
 * @default 16
 * @desc Icon index for empty slots.
 *
 * @param Always draw empty slot
 * @default 0
 * @desc
 *  Always draw empty slots or not.
 *  0: Empty only  1: Always
 *
 * @param Master level AP
 * @default MASTER
 * @desc AP display of an orb whose level reached the upper limit.
 *
 * @param Element color
 * @default 6
 * @desc Text color for element names. Same as \C[x] notation in messages.
 *
 * @param Parameter up color
 * @default 3
 * @desc Text color for up parameter. Same as \C[x] notation in messages.
 *
 * @param Parameter down color
 * @default 2
 * @desc Text color for down parameter. Same as \C[x] notation in messages.
 *
 * @param Open command button
 * @default shift
 * @desc The button to open command window on the ability orb scene.
 *
 * @param Orb equipped SE
 * @default Sword2, 90, 150
 * @desc
 * Format: Filename, Volume, Pitch, Pan
 * The SE for changing orb equipments. Filename is essential.
 *
 * @help
 *
 * ## Plugin commands
 *   AbilityOrb gainOrb 3 1     # Gain an orb whose ID is 3 and level is 1
 *   AbilityOrb loseOrb 2 2     # Dispose 2 orbs whose ID is 2
 *   AbilityOrb loseAllOrb      # Dispose all possessed orbs (equipped orbs are excluded)
 *   AbilityOrb gainAp 5 100    # Actor5 obtains 100 AP
 *   AbilityOrb releaseAll 1    # Unequip all of the actor1's orb
 *   AbilityOrb callMenu 0      # Transit to ability orb menu for the actor in the head of party
 */

/*:ja
 * @plugindesc
 * [v0.1.0] アビリティオーブ機能を追加します。
 *
 * @author TOMY (Kamesoft)
 *
 * @param Orb name
 * @default オーブ
 * @desc アビリティオーブ全般の名称です。
 *
 * @param AP caption
 * @default ＡＰ
 * @desc AP を表示する際の名称です。
 *
 * @param Command name
 * @default アビリティオーブ
 * @desc メニュー画面に表示するコマンド名です。
 *
 * @param Sort command name
 * @default 整頓
 * @desc アビリティオーブの並び替えコマンド名です。
 *
 * @param Sort condition: category
 * @default 種類
 * @desc アビリティオーブを種類順で並び替えるときの表記です。
 *
 * @param Sort condition: name
 * @default 名前
 * @desc アビリティオーブを名前順で並び替えるときの表記です。
 *
 * @param Skill list name
 * @default スキルリスト
 * @desc オーブ情報のスキル一覧の名称です。
 *
 * @param Effect list name
 * @default 装備効果
 * @desc オーブ情報の装備効果の名称です。
 *
 * @param Pair effect: element
 * @default 属性付与
 * @desc 属性付与連結効果の名称です。
 *
 * @param Pair effect: state
 * @default ステート付与
 * @desc ステート付与連結効果の名称です。
 *
 * @param Pair effect: flexible scope
 * @default 全体化
 * @desc 全体化連結効果の名称です。
 *
 * @param Obtain AP message
 * @default %1 の%2を獲得！
 * @desc 戦闘後の AP 獲得時に表示するメッセージです。
 *
 * @param Level up message
 * @default %1の%2「%3」が%4 %5 になった！
 * @desc アビリティオーブのレベルアップ時に表示するメッセージです。
 *
 * @param Increase message
 * @default %1「%2」が分裂した！
 * @desc アビリティオーブが増殖したときに表示するメッセージです。
 *
 * @param Empty slot icon
 * @default 16
 * @desc 空きスロットに表示するアイコンの番号です。
 *
 * @param Always draw empty slot
 * @default 0
 * @desc
 * 空スロットのアイコン描画条件を指定します。
 *  0: オーブ装備時は描画しない  1: 常に描画
 *
 * @param Master level AP
 * @default MASTER
 * @desc レベルが上限に達したアビリティオーブの AP 表示です。
 *
 * @param Element color
 * @default 6
 * @desc
 * 属性名の色です。
 * メッセージウィンドウで \C[x] に指定する番号と同じです。
 *
 * @param Parameter up color
 * @default 3
 * @desc
 * 上昇するパラメータの色です。
 * メッセージウィンドウで \C[x] に指定する番号と同じです。
 *
 * @param Parameter down color
 * @default 2
 * @desc
 *  低下するパラメータの色です。
 *  メッセージウィンドウで \C[x] に指定する番号と同じです。
 *
 * @param Open command button
 * @default shift
 * @desc オーブ装備画面でコマンドを開くためのボタンです。
 *
 * @param Orb equipped SE
 * @default Sword2, 90, 150
 * @desc
 * 書式: ファイル名, ボリューム, ピッチ, パン
 * オーブ装備時に演奏する SE です。ボリューム以降は省略できます。
 *
 * @help
 *
 * ■ プラグインコマンド
 *   AbilityOrb gainOrb 3 1     # オーブ ID:3 をレベル 1 状態で取得
 *   AbilityOrb loseOrb 2 2     # オーブ ID:2 を 2 個破棄
 *   AbilityOrb loseAllOrb      # 所持しているオーブを全て破棄
 *   AbilityOrb gainAp 5 100    # アクター ID:5 に AP を 100 加算
 *   AbilityOrb releaseAll 1    # アクター ID:1 のオーブ装備を全解除
 *   AbilityOrb callMenu 0      # パーティ先頭のアクターのオーブ装備画面を開く
 */

var KMS = KMS || {};

// json から読み込んだアビリティオーブのデータ
var $dataKmsAbilityOrbs = null;

// セーブデータからの復元を可能にするため、セーブデータに入るクラスをグローバルスコープに置く
function Game_AbilityOrb()
{
    this.initialize.apply(this, arguments);
}

function Game_AbilityOrbList()
{
    this.initialize.apply(this, arguments);
}

(function() {

'use strict';

KMS.imported = KMS.imported || {};
KMS.imported['AbilityOrb'] = true;

var pluginParams = PluginManager.parameters('KMS_AbilityOrb');
var Params = {};
Params.orbName              = pluginParams['Orb name'] || 'Orb';
Params.apName               = pluginParams['AP caption'] || 'AP';
Params.commandName          = pluginParams['Command name'] || 'Ability orb';
Params.sortName             = pluginParams['Sort command name'] || 'Sort';
Params.skillListName        = pluginParams['Skill list name'] || 'Skill list';
Params.effectsName          = pluginParams['Effect list name'] || 'Equipment effects';
Params.obtainApMessage      = pluginParams['Obtain AP message'] || '%1 %2 received!';
Params.orbLevelUpMessage    = pluginParams['Level up message'] || '%1\'s %2 "%3" is now %4 %5!';
Params.orbIncreaseMessage   = pluginParams['Increase message'] || '%1 "%2" increased!';
Params.emptySlotIcon        = Number(pluginParams['Empty slot icon']) || 16;
Params.alwaysDrawEmptySlot  = Number(pluginParams['Always draw empty slot']) || 0;
Params.masterLevelApText    = pluginParams['Master level AP'] || 'MASTER';
Params.elementTextColor     = Number(pluginParams['Element color']) || 6;
Params.upTextColor          = Number(pluginParams['Parameter up color']) || 3;
Params.downTextColor        = Number(pluginParams['Parameter down color']) || 2;
Params.buttonForOpenCommand = pluginParams['Open command button'] || 'shift';
Params.buttonForReleaseOrb  = pluginParams['Release orb button'] || 'tab';

// オーブ装備 SE の解析
(function()
{
    Params.orbEquippedSe = null;

    var param = pluginParams['Orb equipped SE'];
    if (!param)
    {
        return;
    }

    var paramArgs = param.replace(/\s+/g, '').split(/,/);
    if (paramArgs.length <= 0)
    {
        return;
    }

    Params.orbEquippedSe = {
        name: paramArgs[0],
        volume: Number(paramArgs[1]) || 90,
        pitch: Number(paramArgs[2]) || 100,
        pan: Number(paramArgs[3]) || 0
    };
})();

// ソートコマンドの名前
Params.sortText = {
    category: pluginParams['Sort condition: category'] || 'Category',
    name:     pluginParams['Sort condition: name'] || 'Name'
};

// 連結効果の名前
Params.pairEffectName = {
    element:       pluginParams['Pair effect: element'] || 'Element effect',
    state:         pluginParams['Pair effect: state'] || 'State effect',
    flexibleScope: pluginParams['Pair effect: flexible scope'] || 'Flexible scope'
};

var Const = {};
Const.slotCountMax          = 8;    // オーブスロットの最大数
Const.connectedSlotCountMax = 4;    // オーブスロットの最大連結数
Const.basicParameterCount   = 8;    // 基本パラメータの数

// 連結効果の種類
//   連結効果は { code: x, argument: y } の形で格納される
Const.pairEffectCode = {
    enableElement: 0,   // 属性付与 (arg: 効果率)
    enableState:   1,   // ステート付与 (arg: 効果率)
    mpCost:        2,   // MP 消費量補正 (arg: 変動率)
    tpCost:        3,   // TP 消費量補正 (arg: 変動率)
    skillPower:    4,   // 威力補正 (arg: 変動率)
    flexibleScope: 5    // 全体化 (arg: なし)
};

Const.pluginCommandCode      = 'AbilityOrb';        // プラグインコマンドコード
Const.abilityOrbShopCategory = 'kms_abilityOrb';    // ショップのカテゴリーキー
Const.itemCategoryKey        = 'kms_abilityOrb';    // アイテムのカテゴリーキー
Const.menuCommandKey         = 'kms_abilityOrb';    // メニューコマンドのキー

// 装備タイプのキー
Const.equipType = {
    weapon: 'weapon',
    armor:  'armor'
};

// ソートコマンドのキー
Const.sortKey = {
    id:       'sortById',
    category: 'sortByCategory',
    name:     'sortByName',
    level:    'sortByLevel',
    ap:       'sortByAp'
};

// スロット情報解析用正規表現
// <例>
//  <kms_orbslot: 2>       # 2 スロット, 連結なし
//  <kms_orbslot: 4, 1>    # 4 スロット, 1 連結
var AbilityOrbSlotInfoRegExp = /(\d+)(?:\s*,\s*)?(\d+)?/;

// オーブのソート方法
var OrbSortMethods =
{
    // ID 昇順
    id:
        function(a, b) { return a.id - b.id; },
    // 名前昇順
    name:
        function(a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; },
    // カテゴリ昇順
    category:
        function(a, b) { return a.category.id - b.category.id; },
    // レベル昇順
    levelAscend:
        function(a, b) { return a.level - b.level; },
    // レベル降順
    levelDescend:
        function(a, b) { return b.level - a.level; },
    // AP 昇順
    apAscend:
        function(a, b) { return a.currentAp() - b.currentAp(); },
    // AP 降順
    apDescend:
        function(a, b) { return b.currentAp() - a.currentAp(); },
    // 増殖する順
    increasable:
        function(a, b) { return (a.increasable ? 0 : 1) - (b.increasable ? 0 : 1); },
};

var _KMS_Game_Interpreter_pluginCommand =
        Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args)
{
    _KMS_Game_Interpreter_pluginCommand.call(this, command, args);

    if (command !== Const.pluginCommandCode)
    {
        return;
    }

    switch (args[0])
    {
    case 'gainOrb':     // オーブ取得 (OrbID  Level)
        $gameParty.gainAbilityOrbById(Number(args[1]), Number(args[2]));
        break;
    case 'loseOrb':     // オーブ破棄 (OrbID  Count)
        $gameParty.loseAbilityOrbById(Number(args[1]), Number(args[2]));
        break;
    case 'loseAllOrb':  // オーブ全削除
        $gameParty.clearAbilityOrb();
        break;
    case 'gainAp':      // AP 獲得 (ActorID  AP  displayFlag)
        gainApByPluginCommand(args);
        break;
    case 'equip':       // オーブ装備 (ActorID  EquipType  SlotIndex  OrbID  Level)
        equipOrbByPluginCommand(args);
        break;
    case 'releaseAll':  // オーブ装備解除 (ActorID)
        releaseAllOrbsByPluginCommand(args);
        break;
    case 'callMenu':    // オーブ装備画面を開く (ActorID)
        callAbilityOrbSceneByPluginCommand(args);
        break;
    default:
        // 不明なコマンド
        console.log('[%1 %2] Unknown command.'.format(Const.pluginCommandCode, args[0]));
        break;
    }
};

/**
 * プラグインコマンドによる AP 獲得処理
 */
function gainApByPluginCommand(args)
{
    var target = Number(args[1]);
    if (isNaN(target) || target < 0)
    {
        console.log('[%1 %2] Invalid target: %3'.format(Const.pluginCommandCode, args[0], args[1]));
        return;
    }

    var ap = Number(args[2]);
    if (isNaN(ap))
    {
        console.log('[%1 %2] Invalid AP value: %3'.format(Const.pluginCommandCode, args[0], args[2]));
        return;
    }

    var display = (args[3] === 'true' || !!Number(args[3]));
    if (target > 0)
    {
        // 個別指定
        $gameActors.actor(target).gainAp(ap, display);
    }
    else
    {
        // 全体
        $gameParty.allMembers().forEach(function(actor)
        {
            actor.gainAp(ap, display);
        });
    }
}

/**
 * プラグインコマンドによるオーブ装備処理
 */
function equipOrbByPluginCommand(args)
{
    var actorId = Number(args[1]);
    if (!isNaN(actorId) || actorId < 1)
    {
        console.log('[%1 %2] Invalid actor ID: %3'.format(Const.pluginCommandCode, args[0], args[1]));
        return;
    }

    var type = args[2];
    var slotIndex = Number(args[3]);
    if (!isNaN(slotIndex) || slotIndex < 0 || slotIndex > Const.slotCountMax)
    {
        console.log('[%1 %2] Invalid slot index: %3'.format(Const.pluginCommandCode, args[0], args[3]));
        return;
    }

    var orbId = Number(args[4]);
    if (!isNaN(orbId) || orbId < 1)
    {
        console.log('[%1 %2] Invalid orb ID: %3'.format(Const.pluginCommandCode, args[0], args[4]));
        return;
    }

    var orbLevel = Number(args[5]);
    if (!isNaN(orbLevel) || orbLevel < 1)
    {
        console.log('[%1 %2] Invalid orb level: %3'.format(Const.pluginCommandCode, args[0], args[5]));
        return;
    }

    var orb = $gameParty.gainAbilityOrbById(Number(args[1]), Number(args[2]));
    if (orb != null)
    {
        $gameActors(actorId).equipAbilityOrb(type, slotIndex, orb, true);
    }
}

/**
 * プラグインコマンドによる全装備解除処理
 */
function relaseAllOrbsApByPluginCommand(args)
{
    var target = Number(args[1]);
    if (isNaN(target) || target < 0)
    {
        console.log('[%1 %2] Invalid target: %3'.format(Const.pluginCommandCode, args[0], args[1]));
        return;
    }

    if (target > 0)
    {
        // 個別指定
        $gameActors.actor(target).releaseAllAbilityOrb();
    }
    else
    {
        // 全体
        $gameParty.allMembers().forEach(function(actor)
        {
            actor.releaseAllAbilityOrb();
        });
    }
}

/**
 * プラグインコマンドによるオーブ装備画面遷移
 */
function callAbilityOrbSceneByPluginCommand(args)
{
    var actorIndex = Number(args[1]) || 0;
    var actor = $gameParty.members()[actorIndex];
    if (!$gameParty.inBattle() && actor)
    {
        $gameParty.setMenuActor(actor);
        SceneManager.push(Scene_AbilityOrb);
    }
}


// ----------------------------------------------------------------

/**
 * 配列の和集合を生成
 *
 * @param {Array} lhr   対象の配列 1
 * @param {Array} rhr   対象の配列 2
 *
 * @return 生成結果
 */
function unionArray(lhs, rhs)
{
    console.assert(lhs instanceof Array && rhs instanceof Array, 'Arguments are not Array.');

    var newArray = lhs.concat();

    for (var i = 0; i < rhs.length; i++)
    {
        if (!newArray.contains(rhs[i]))
        {
            newArray.push(rhs[i]);
        }
    }

    return newArray;
};

/**
 * 配列内の null を削除
 *
 * @param {Array} array     対象の配列
 *
 * @return null が削除された配列
 */
function compactArray(array)
{
    console.assert(array instanceof Array, 'Argument is not Array.');

    return array.filter(function(item)
    {
        return item != null;
    });
}

/**
 * 配列の重複要素を削除
 *
 * @param {Array} array     対象の配列
 *
 * @return 重複要素を削除した配列
 */
function uniqueArray(array)
{
    console.assert(array instanceof Array, 'Argument is not Array.');

    return array.filter(function(item, index, ary)
    {
        return index === ary.indexOf(item);
    });
}

/**
 * 安定ソート
 *
 * @param {Array}    array          対象の配列
 * @param {Function} comparator     比較関数
 */
function stableSort(array, comparator)
{
    console.assert(array instanceof Array, 'Argument is not Array.');
    console.assert(comparator instanceof Function, 'Invalid comparator.');

    // 配列のデータをペア化
    function toPair(target)
    {
        for (var i = 0; i < target.length; i++)
        {
            target[i] = { key: i, value: target[i] };
        }
    }

    // ペアから配列に戻す
    function fromPair(target)
    {
        for (var i = 0; i < target.length; i++)
        {
            target[i] = target[i].value;
        }
    }

    toPair(array);

    array.sort(function(a, b)
    {
        // 比較関数が一致判定になる場合はインデックスで比較
        var comp = comparator(a.value, b.value);
        return comp === 0 ? (a.key - b.key) : comp;
    });

    fromPair(array);
}

// ----------------------------------------------------------------

/**
 * オーブのデータベース情報を取得
 *
 * @param {Number}  orbId   オーブ ID
 *
 * @return データベースのオーブ情報
 */
function getAbilityOrbData(orbId)
{
    var orb = $dataKmsAbilityOrbs.orbs[orbId];
    if (orb.isAbilityOrb == null)
    {
        generateAbilityOrbExtraData(orb);
    }

    return orb;
}

/**
 * オーブカテゴリーのデータベース情報を取得
 *
 * @param {Number}  categoryId  オーブカテゴリー ID
 *
 * @return データベースのカテゴリー情報
 */
function getAbilityOrbCategoryData(categoryId)
{
    return $dataKmsAbilityOrbs.categories[categoryId];
}

/**
 * Orb 定義の一部データを動的生成
 *
 * @param {object} orb  json から読み込んだオーブ定義
 */
function generateAbilityOrbExtraData(orb)
{
    orb.isAbilityOrb = true;
    generateAbilityOrbLevelInfo(orb);
}

/**
 * Orb 定義の各レベルの一部データを動的生成
 *
 * @param {object} orb  json から読み込んだオーブ定義
 */
function generateAbilityOrbLevelInfo(orb)
{
    // 配列の継承
    function inheritList(lhs, rhs, param)
    {
        lhs[param] = uniqueArray(rhs[param].concat(lhs[param]));
    }

    // パラメータの継承
    function inheritParam(lhs, rhs)
    {
        for (var i = 0; i < lhs.parameters.plus.length; i++)
        {
            lhs.parameters.plus[i] = rhs.parameters.plus[i];
            lhs.parameters.rate[i] = rhs.parameters.rate[i];
        }
    }

    // 新規 or 再定義されていないプロパティを継承
    function inheritNotDefinedProperty(lhs, rhs, prop)
    {
        var _undefined;  // undefined 判定用

        Object.getOwnPropertyNames(rhs.pairEffects).forEach(function(key)
        {
            if (lhs[prop][key] === _undefined)
            {
                lhs[prop][key] = rhs[prop][key];
            }
        });
    }

    orb.iconIndex = $dataKmsAbilityOrbs.categories[orb.category].iconIndex;

    for (var i = 0; i < orb.levels.length; i++)
    {
        var currLevel = orb.levels[i];
        var prevLevel = (i > 0 ? orb.levels[i - 1] : null);

        if (prevLevel == null)
        {
            // レベル 1 は何も継承しない
            currLevel.totalAp = 0;
            continue;
        }

        // 累計 AP
        currLevel.totalAp = prevLevel.totalAp + prevLevel.nextLevelAp;

        // 習得スキル継承
        if (currLevel.inheritSkill)
        {
            inheritList(currLevel, prevLevel, 'skills');
        }

        // パラメータ継承
        if (currLevel.inheritParameter)
        {
            inheritParam(currLevel, prevLevel);
        }

        // 属性継承
        if (currLevel.inheritElement)
        {
            inheritList(currLevel, prevLevel, 'elements');
        }

        // ステート継承
        if (currLevel.inheritState)
        {
            inheritList(currLevel, prevLevel, 'states');
        }

        // 連結効果継承
        if (currLevel.inheritPairEffect)
        {
            // prevLevel の効果のうち、currLevel で未定義のものだけを継承する
            inheritNotDefinedProperty(currLevel, prevLevel, 'pairEffects');
        }
    }
}

/**
 * 装備品のスロット数情報を取得
 */
function getEquipmentAbilityOrbSlotInfo(item)
{
    console.assert(item != null, 'Argument must not be null.');

    if (item.abilityOrbSlotInfo == null)
    {
        var info = { count: 0, connect: 0 };
        if (item.meta.kms_orbslot != null)
        {
            var match = item.meta.kms_orbslot.match(AbilityOrbSlotInfoRegExp);
            if (match)
            {
                info.count = Math.min(Number(match[1]), Const.slotCountMax);
                if (match[2])
                {
                    // スロット数 / 2 が連結数の上限
                    var maxConnect = Math.min(
                        Math.floor(info.count / 2),
                        Const.connectedSlotCountMax);
                    info.connect = Math.min(Number(match[2]), maxConnect);
                }
            }
        }
        item.abilityOrbSlotInfo = info;
    }

    return item.abilityOrbSlotInfo;
}

/**
 * 敵の所持 AP を取得
 */
function getEnemyAp(enemyId)
{
    var enemy = $dataEnemies[enemyId];
    console.assert(enemy != null, 'Invalid enemy id: %1'.format(enemyId));

    return Math.max(Number(enemy.meta.kms_ap) || 0, 0);
}


//-----------------------------------------------------------------------------
// DataManager

var _KMS_DataManager_loadDataBase = DataManager.loadDatabase;
DataManager.loadDatabase = function()
{
    _KMS_DataManager_loadDataBase.call(this);

    this.loadDataFile('$dataKmsAbilityOrbs', 'KMS_AbilityOrbs.json');
};

var _KMS_DataManager_onLoad = DataManager.onLoad;
DataManager.onLoad = function(object)
{
    _KMS_DataManager_onLoad.call(this, object);

    if (object === $dataKmsAbilityOrbs)
    {
        object.orbs.forEach(function(orb)
        {
            if (orb != null)
            {
                generateAbilityOrbExtraData(orb);
            }
        });
    }
};

/**
 * オーブであるか判定
 */
DataManager.isAbilityOrb = function(item)
{
    return item != null && item.isAbilityOrb;
};

var _KMS_DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents)
{
    _KMS_DataManager_extractSaveContents.call(this, contents);

    // 装備品のスロット数変更に対応するため、超過分を外す
    $gameActors._data.forEach(function(actor)
    {
        if (actor)
        {
            actor.releaseExcessOrbs();
        }
    });
};

//-----------------------------------------------------------------------------
// TextManager

Object.defineProperties(TextManager, {
    ap:                  { get: function() { return Params.apName; },             configurable: true },
    abilityOrb:          { get: function() { return Params.orbName; },            configurable: true },
    abilityOrbObtainAp:  { get: function() { return Params.obtainApMessage; },    configurable: true },
    abilityOrbLevelUp:   { get: function() { return Params.orbLevelUpMessage; },  configurable: true },
    abilityOrbIncrease:  { get: function() { return Params.orbIncreaseMessage; }, configurable: true },
    abilityOrbCommand:   { get: function() { return Params.commandName; },        configurable: true },
    abilityOrbSkillList: { get: function() { return Params.skillListName; },      configurable: true },
    abilityOrbEffects:   { get: function() { return Params.effectsName; },        configurable: true },

    abilityOrbSortByCategory: { get: function() { return Params.sortText.category; }, configurable: true },
    abilityOrbSortByName:     { get: function() { return Params.sortText.name; },     configurable: true },
    abilityOrbSortByLevel:    { get: function() { return TextManager.level; },        configurable: true },
    abilityOrbSortByAp:       { get: function() { return TextManager.ap; },           configurable: true }
});


//-----------------------------------------------------------------------------
// SoundManager

/**
 * オーブ装備時の SE を再生
 */
SoundManager.playEquipAbilityOrb = function()
{
    if (Params.orbEquippedSe)
    {
        AudioManager.playSe(Params.orbEquippedSe);
    }
    else
    {
        // 未設定の場合は装備 SE
        this.playEquip();
    }
};


//-----------------------------------------------------------------------------
// BattleManager

var _KMS_BattleManager_makeRewards = BattleManager.makeRewards;
BattleManager.makeRewards = function()
{
    _KMS_BattleManager_makeRewards.call(this);

    this._rewards.ap = $gameTroop.apTotal();
};

var _KMS_BattleManager_displayRewards = BattleManager.displayRewards;
BattleManager.displayRewards = function()
{
    _KMS_BattleManager_displayRewards.call(this);

    this.displayAp();
};

var _KMS_BattleManager_gainRewards = BattleManager.gainRewards;
BattleManager.gainRewards = function()
{
    _KMS_BattleManager_gainRewards.call(this);

    this.gainAp();
};

/**
 * 獲得 AP の表示
 */
BattleManager.displayAp = function()
{
    var ap = this._rewards.ap;
    if (ap > 0)
    {
        var text = TextManager.abilityOrbObtainAp.format(ap, TextManager.ap);
        $gameMessage.add('\\.' + text);
    }
};

/**
 * AP の獲得
 */
BattleManager.gainAp = function()
{
    var ap = this._rewards.ap;
    $gameParty.allMembers().forEach(function(actor)
    {
        actor.gainAp(ap, actor.shouldDisplayLevelUp());
    });
};


//-----------------------------------------------------------------------------
// Game_Temp

Object.defineProperties(Game_Temp.prototype, {
    // オーブ補正キャッシュ
    abilityOrbParameterRevs: {
        get: function() { return this._abilityOrbParameterRevs; },
        set: function(value) { this._abilityOrbParameterRevs = value; },
        configurable: true
    },

    // 店に並べるオーブ
    shopAbilityOrbs: {
        get: function() { return this._shopAbilityOrbs; },
        set: function(value) { this._shopAbilityOrbs = value; },
        configurable: true
    }
});

var _KMS_Game_Temp_initialize = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function()
{
    _KMS_Game_Temp_initialize.call(this);

    this.clearAbilityOrbParameterRevs();
    this.clearShopAbilityOrbs();
};

/**
 * オーブ補正キャッシュの初期化
 */
Game_Temp.prototype.clearAbilityOrbParameterRevs = function()
{
    this._abilityOrbParameterRevs = [];
};

/**
 * 店に並べるオーブの一覧をクリア
 */
Game_Temp.prototype.clearShopAbilityOrbs = function()
{
    this._shopAbilityOrbs = [];
};


//-----------------------------------------------------------------------------
// Game_AbilityOrb
//
// アビリティオーブの成長状態を保持するクラス。

Object.defineProperties(Game_AbilityOrb.prototype, {
    isAbilityOrb: { get: function() { return true; },                          configurable: true },

    id:           { get: function() { return this._orbId; },                   configurable: true },
    name:         { get: function() { return this.orbData().name; },           configurable: true },
    description:  { get: function() { return this.orbData().description; },    configurable: true },
    category:     { get: function() { return this.categoryData(); },           configurable: true },
    iconIndex:    { get: function() { return this.category.iconIndex; },       configurable: true },
    increasable:  { get: function() { return this.orbData().increasable; },    configurable: true },
    levels:       { get: function() { return this.orbData().levels; },         configurable: true },

    level:        { get: function() { return this._level; },                   configurable: true },
    price:        { get: function() { return this.currentLevelData().price; }, configurable: true },
    increased:    { get: function() { return this._increased; },               configurable: true }
});

/**
 * オブジェクト初期化
 */
Game_AbilityOrb.prototype.initialize = function(orbId, level)
{
    this.setup(orbId, level);
};

/**
 * セットアップ
 */
Game_AbilityOrb.prototype.setup = function(orbId, level)
{
    this._orbId     = orbId;
    this._ap        = 0;
    this._level     = 1;
    this._increased = false;

    if (level && level > 1)
    {
        this.changeLevel(level);
    }
};

/**
 * オーブデータの取得
 */
Game_AbilityOrb.prototype.orbData = function()
{
    return getAbilityOrbData(this._orbId);
};

/**
 * カテゴリーデータの取得
 */
Game_AbilityOrb.prototype.categoryData = function()
{
    return getAbilityOrbCategoryData(this.orbData().category);
};

/**
 * 現在のレベルデータの取得
 */
Game_AbilityOrb.prototype.currentLevelData = function()
{
    return this.levels[this._level - 1];
};

/**
 * 最大レベル
 */
Game_AbilityOrb.prototype.maxLevel = function()
{
    return this.levels.length;
};

/**
 * 指定レベルに必要な累計 AP
 */
Game_AbilityOrb.prototype.apForLevel = function(level)
{
    if (level <= 1)
    {
        return 0;
    }

    return this.levels[Math.min(level, this.maxLevel()) - 1].totalAp;
};

/**
 * 最大レベルに必要な累計 AP
 */
Game_AbilityOrb.prototype.apForMaxLevel = function()
{
    return this.apForLevel(this.maxLevel());
};

/**
 * AP の初期化
 */
Game_AbilityOrb.prototype.initAp = function()
{
    this._ap = this.currentLevelAp();
};

/**
 * 現在の AP
 */
Game_AbilityOrb.prototype.currentAp = function()
{
    return this._ap;
};

/**
 * 現在のレベルに必要な累計 AP
 */
Game_AbilityOrb.prototype.currentLevelAp = function()
{
    return this.apForLevel(this._level);
};

/**
 * 次のレベルに必要な累計 AP
 */
Game_AbilityOrb.prototype.nextLevelAp = function()
{
    return this.apForLevel(this._level + 1);
};

/**
 * 次のレベルに上がるために必要な AP
 */
Game_AbilityOrb.prototype.nextRequiredAp = function()
{
    return this.nextLevelAp() - this.currentAp();
};

/**
 * 最大レベルか
 */
Game_AbilityOrb.prototype.isMaxLevel = function()
{
    return this._level >= this.maxLevel();
};

/**
 * AP の変更
 */
Game_AbilityOrb.prototype.changeAp = function(ap)
{
    this._ap = ap.clamp(0, this.apForMaxLevel());

    while (!this.isMaxLevel() && this.currentAp() >= this.nextLevelAp())
    {
        this.levelUp();
    }

    while (this.currentAp() < this.currentLevelAp())
    {
        this.levelDown();
    }
};

/**
 * AP の加算
 */
Game_AbilityOrb.prototype.gainAp = function(ap, rate)
{
    if (rate == null)
    {
        rate = 1;
    }

    var newAp = this.currentAp() + Math.round(ap * rate);
    this.changeAp(newAp);
};

/**
 * レベルアップ
 */
Game_AbilityOrb.prototype.levelUp = function()
{
    if (this._level < this.maxLevel())
    {
        this._level++;
        if (this.isMaxLevel() && this.increasable)
        {
            this.increase();
        }
    }
};

/**
 * レベルダウン
 */
Game_AbilityOrb.prototype.levelDown = function()
{
    if (this._level > 1)
    {
        this._level--;
    }
};

/**
 * 増殖
 */
Game_AbilityOrb.prototype.increase = function()
{
    $gameParty.gainAbilityOrbById(this.id, 1);
    this._increased = true;
};

/**
 * レベルの変更
 */
Game_AbilityOrb.prototype.changeLevel = function(level)
{
    level = level.clamp(1, this.maxLevel());
    this.changeAp(this.apForLevel(level));
};

/**
 * 習得スキルリストを取得
 */
Game_AbilityOrb.prototype.getSkills = function()
{
    return this.currentLevelData().skills;
};

/**
 * パラメータ補正を取得
 */
Game_AbilityOrb.prototype.getParameters = function()
{
    return this.currentLevelData().parameters;
};

/**
 * 属性を取得
 */
Game_AbilityOrb.prototype.getElements = function()
{
    return this.currentLevelData().elements;
};

/**
 * ステートを取得
 */
Game_AbilityOrb.prototype.getStates = function()
{
    return this.currentLevelData().states;
};

/**
 * 連結効果を取得
 */
Game_AbilityOrb.prototype.getPairEffects = function()
{
    return this.currentLevelData().pairEffects;
};


//-----------------------------------------------------------------------------
// Game_AbilityOrbList
//
// 所持しているアビリティオーブを管理するクラス。

Object.defineProperties(Game_AbilityOrbList.prototype, {
    orbs: {
        get: function() { return this._orbs; },
        set: function(value) { this._orbs = value; } ,
        configurable: true
    },
});

/**
 * オブジェクト初期化
 */
Game_AbilityOrbList.prototype.initialize = function()
{
    this.clear();
};

/**
 * 所持オーブのクリア
 */
Game_AbilityOrbList.prototype.clear = function()
{
    this._orbs = [];
};


/**
 * 末尾の空白要素を削除
 */
Game_AbilityOrbList.prototype.compactTail = function()
{
    while (this._orbs.length > 0 && this._orbs[this._orbs.length - 1] == null)
    {
        this._orbs.pop();
    }
};

/**
 * 指定した ID のオーブ所持数
 *
 * @param {Function} sortMethod     ソート順定義関数
 * @param {Boolean}  isDescend      true: 降順  false: 昇順
 */
Game_AbilityOrbList.prototype.numberByIds = function(orbId)
{
    return this._orbs.reduce(function(r, orb)
    {
        return r + (orb && orb.id === orbId ? 1 : 0);
    }, 0);
};

/**
 * オーブのソート
 *
 * @param {Function} sortMethod     ソート順定義関数
 * @param {Boolean}  isDescend      true: 降順  false: 昇順
 */
Game_AbilityOrbList.prototype.sort = function(sortMethod, isDescend)
{
    console.assert(OrbSortMethods[sortMethod] != null, 'Invalid sort method.');

    this._orbs = compactArray(this._orbs);
    stableSort(this._orbs, OrbSortMethods[sortMethod]);

    if (isDescend)
    {
        this._orbs.reverse();
    }
};

/**
 * オーブの取得
 *
 * @param {object} orb      取得するオーブ
 * @param {Number} index    オーブの取得先位置。空いていなければ最初の空きに追加。
 */
Game_AbilityOrbList.prototype.gain = function(orb, index)
{
    // 全く同じ個体が複数取得されるのは NG
    console.assert(!this._orbs.contains(orb), 'Specified orb is already gained.');

    if (index != null && this._orbs[index] == null)
    {
        // 指定された index が空いていればそこに入れる
        this._orbs[index] = orb;
    }
    else
    {
        // 最初に見つかった空き場所に入れる
        for (var i = 0; i < this._orbs.length + 1; i++)
        {
            if (this._orbs[i] == null)
            {
                this._orbs[i] = orb;
                break;
            }
        }
    }
};

/**
 * オーブの破棄
 *
 * 破棄したオーブがあった場所は空欄になる。
 *
 * @param {object} orb      破棄するオーブ
 */
Game_AbilityOrbList.prototype.lose = function(orb)
{
    for (var i = 0; i < this._orbs.length; i++)
    {
        if (this._orbs[i] === orb)
        {
            this._orbs[i] = null;
            break;
        }
    }

    this.compactTail();
};

/**
 * 指定した ID のオーブを取得
 *
 * @param {Number} orbId    取得するオーブの ID
 * @param {Number} level    オーブの初期レベル
 *
 * @return 新しく取得したオーブ
 */
Game_AbilityOrbList.prototype.gainById = function(orbId, level)
{
    var orb = new Game_AbilityOrb(orbId, level);
    this._orbs.push(orb);

    return orb;
};

/**
 * 指定した ID のオーブを破棄
 *
 * @param {Number} orbId    破棄するオーブの ID
 * @param {Number} number   破棄する個数。0 なら全て破棄。
 */
Game_AbilityOrbList.prototype.loseById = function(orbId, number)
{
    var loseNumber    = number || 0;
    var disposedCount = 0;

    for (var i = 0; i < this._orbs.length; i++)
    {
        if (this._orbs[i].id !== orbId)
        {
            continue;
        }

        this._orbs[i] = null;
        disposedCount++;

        // 指定個数破棄したら終了
        if (loseNumber > 0 && disposedCount >= loseNumber)
        {
            break;
        }
    }
};


//-----------------------------------------------------------------------------
// Game_AbilityOrbParameterRevCache
//
// オーブによるパラメータ補正を保持するクラス。

function Game_AbilityOrbParameterRevCache()
{
    this.initialize.apply(this, arguments);
}

Object.defineProperties(Game_AbilityOrbParameterRevCache.prototype, {
    paramsPlus:  { get: function() { return this._paramsPlus; },  configurable: true },
    paramsRate:  { get: function() { return this._paramsRate; },  configurable: true },
    skillIds:    { get: function() { return this._skillIds; },    configurable: true },
    resist:      { get: function() { return this._resist; },      configurable: true },
    invalid:     { get: function() { return this._invalid; },     configurable: true },
    attack:      { get: function() { return this._attack; },      configurable: true },
    pairEffects: { get: function() { return this._pairEffects; }, configurable: true },

    flexibleScopedSkillIds: { get: function() { return this._flexibleScopedSkillIds; }, configurable: true }
});

/**
 * 初期化
 */
Game_AbilityOrbParameterRevCache.prototype.initialize = function()
{
    this._paramsPlus  = { param: [] };
    this._paramsRate  = { param: [] };
    this._skillIds    = [];
    this._resist      = { element: [], state: [], debuff: [] };
    this._invalid     = { state: [] };
    this._attack      = { element: [], state: [] };
    this._pairEffects = []

    this._flexibleScopedSkillIds = [];

    for (var i = 0; i < Const.basicParameterCount; i++)
    {
        this._paramsPlus.param[i] = 0;
        this._paramsRate.param[i] = 1.0;
        this._resist.debuff[i]    = 1.0;
    }

    for (var i = 0; i < $dataSystem.elements.length; i++)
    {
        this._resist.element[i] = 1.0;
    }

    for (var i = 0; i < $dataStates.length; i++)
    {
        this._resist.state[i] = 1.0;
    }
};

/**
 * セットアップ
 */
Game_AbilityOrbParameterRevCache.prototype.setup = function(actor)
{
    // 連結効果の適用
    function applyPairEffect(baseOrb, effect, isWeapon)
    {
        switch (effect.code)
        {
        case Const.pairEffectCode.enableElement:
            if (isWeapon)
            {
                // 攻撃属性
                this._attack.element =
                    unionArray(this._attack.element, baseOrb.getElements());
            }
            else
            {
                // 耐性属性
                //  引数 : 有効率
                baseOrb.getElements().forEach(function(elementId)
                {
                    if (this._resist.element[elementId] != null)
                    {
                        this._resist.element[elementId] *= effect.argument;
                    }
                }, this);
            }
            break;
        case Const.pairEffectCode.enableState:
            if (isWeapon)
            {
                // 付与ステート
                //  引数 : 付与率
                baseOrb.getStates().forEach(function(stateId)
                {
                    this._attack.states.push({
                        id: stateId,
                        rate: effect.argument
                    });
                }, this);
            }
            else
            {
                // 防御ステート
                //  引数 : 有効率
                baseOrb.getStates().forEach(function(stateId)
                {
                    if (this._resist.element[stateId] != null)
                    {
                        this._resist.element[stateId] *= effect.argument;
                    }
                }, this);
            }
            break;
        case Const.pairEffectCode.mpCost:
            // TODO: Not implemented
            break;
        case Const.pairEffectCode.tpCost:
            // TODO: Not implemented
            break;
        case Const.pairEffectCode.skillPower:
            // TODO: Not implemented
            break;
        case Const.pairEffectCode.flexibleScope:
            // 全体化対象スキルに追加
            this._flexibleScopedSkillIds = unionArray(
                this._flexibleScopedSkillIds,
                baseOrb.getSkills());
            break;
        default:
            // 専用処理が未定義の場合はそのまま登録
            this._pairEffects.push(effect);
            break;
        }
    }

    actor.allAbilityOrbs().forEach(function(orb)
    {
        // スキル
        this._skillIds = unionArray(this._skillIds, orb.getSkills());

        // パラメータ補正
        var params = orb.getParameters();
        for (var i = 0; i < params.plus.length; i++)
        {
            this._paramsPlus.param[i] += params.plus[i];
            this._paramsRate.param[i] *= params.rate[i];
        }

        // 連結効果
        var pairedOrb = actor.findPairedAbilityOrb(orb);
        if (pairedOrb != null)
        {
            var isWeapon = actor.weaponAbilityOrbs().contains(orb);
            orb.getPairEffects().forEach(function(effect)
            {
                applyPairEffect.call(this, pairedOrb, effect, isWeapon);
            }, this);
        }
    }, this);
};


//-----------------------------------------------------------------------------
// Game_Actor

// 全体化可否判定用関数の定義
// ※ 全体化プラグインの読み込みが終わらないと正しい判定ができないため、最初は定義しない
var _KMS_Game_Actor_isFlexibleScopeItem;
function checkFlexibleScopeImported()
{
    if (_KMS_Game_Actor_isFlexibleScopeItem != null ||
        !KMS.imported['FlexibleScope'])
    {
        return;
    }

    _KMS_Game_Actor_isFlexibleScopeItem = Game_Actor.prototype.isFlexibleScopeItem;
    Game_Actor.prototype.isFlexibleScopeItem = function(item)
    {
        if (_KMS_Game_Actor_isFlexibleScopeItem.call(this, item))
        {
            return true;
        }

        var revs = this.getAbilityOrbParameterRevs();
        var skillIds = revs.flexibleScopedSkillIds;
        for (var i = 0; i < skillIds.length; i++)
        {
            if (item.id === skillIds[i])
            {
                return true;
            }
        }

        return false;
    };
}

// 追加されたスキル
var _KMS_Game_Actor_addedSkills = Game_Actor.prototype.addedSkills;
Game_Actor.prototype.addedSkills = function()
{
    var list = _KMS_Game_Actor_addedSkills.call(this);

    var revs = this.getAbilityOrbParameterRevs();
    return list.concat(revs.skillIds).sort();
};

// パラメータの加算補正
var _KMS_Game_Actor_paramPlus = Game_Actor.prototype.paramPlus;
Game_Actor.prototype.paramPlus = function(paramId)
{
    var value = _KMS_Game_Actor_paramPlus.call(this, paramId);

    var revs = this.getAbilityOrbParameterRevs();
    return value + revs.paramsPlus.param[paramId];
};

// パラメータの割合補正
var _KMS_Game_Actor_paramRate = Game_Actor.prototype.paramRate;
Game_Actor.prototype.paramRate = function(paramId)
{
    var rate = _KMS_Game_Actor_paramRate.call(this, paramId);

    var revs = this.getAbilityOrbParameterRevs();
    return rate * revs.paramsRate.param[paramId];
};

// 属性耐性
var _KMS_Game_Actor_elementRate = Game_Actor.prototype.elementRate;
Game_Actor.prototype.elementRate = function(elementId)
{
    var value = _KMS_Game_Actor_elementRate.call(this, elementId);

    var revs = this.getAbilityOrbParameterRevs();
    return value * revs.resist.element[elementId];
};

// ステート耐性
var _KMS_Game_Actor_stateRate = Game_Actor.prototype.stateRate;
Game_Actor.prototype.stateRate = function(stateId)
{
    var value = _KMS_Game_Actor_stateRate.call(this, stateId);

    var revs = this.getAbilityOrbParameterRevs();
    return value * revs.resist.state[stateId];
};

// ステート無効
var _KMS_Game_Actor_stateResistSet = Game_Actor.prototype.stateResistSet;
Game_Actor.prototype.stateResistSet = function()
{
    var list = _KMS_Game_Actor_stateResistSet.call(this);

    var revs = this.getAbilityOrbParameterRevs();
    return list.concat(revs.invalid.state);
};

// 攻撃属性
var _KMS_Game_Actor_attackElement = Game_Actor.prototype.attackElements;
Game_Actor.prototype.attackElements = function()
{
    var list = _KMS_Game_Actor_attackElement.call(this);

    var revs = this.getAbilityOrbParameterRevs();
    return list.concat(revs.attack.element);
};

// 攻撃時付与ステート
var _KMS_Game_Actor_attackStates = Game_Actor.prototype.attackStates;
Game_Actor.prototype.attackStates = function()
{
    var list = _KMS_Game_Actor_attackStates.call(this);

    var revs = this.getAbilityOrbParameterRevs();
    var states = revs.attack.state;
    for (var i = 0; i < states.length; i++)
    {
        if (!list.contains(states[i].id))
        {
            list.push(states[i].id);
        }
    }

    return list;
};

// 攻撃時ステート付与確率
var _KMS_Game_Actor_attackStatesRate = Game_Actor.prototype.attackStatesRate;
Game_Actor.prototype.attackStatesRate = function(stateId)
{
    var value = _KMS_Game_Actor_attackStatesRate.call(this, stateId);

    var revs = this.getAbilityOrbParameterRevs();
    var states = revs.attack.state;
    for (var i = 0; i < states.length; i++)
    {
        if (states[i].id === stateId)
        {
            value += states[i].rate;
        }
    }

    return value;
};

// 装備変更
var _KMS_Game_Actor_changeEquip = Game_Actor.prototype.changeEquip;
Game_Actor.prototype.changeEquip = function(slotId, item)
{
    _KMS_Game_Actor_changeEquip.call(this, slotId, item);

    this.releaseExcessOrbs();
};

/**
 * オーブによるスキル、能力値補正を取得
 */
Game_Actor.prototype.getAbilityOrbParameterRevs = function()
{
    if ($gameTemp.abilityOrbParameterRevs[this.actorId()] == null)
    {
        this.updateAbilityOrbParameterRevs();
    }

    return $gameTemp.abilityOrbParameterRevs[this.actorId()];
};

/**
 * オーブによるスキル、能力値補正を更新
 */
Game_Actor.prototype.updateAbilityOrbParameterRevs = function()
{
    var cache = new Game_AbilityOrbParameterRevCache();
    cache.setup(this);

    $gameTemp.abilityOrbParameterRevs[this.actorId()] = cache;

    checkFlexibleScopeImported();
};

/**
 * オーブによるスキル、能力値補正を無効化
 */
Game_Actor.prototype.invalidateAbilityOrbParameterRevs = function()
{
    $gameTemp.abilityOrbParameterRevs[this.actorId()] = undefined;

    // パッシブスキルのキャッシュも無効化
    if (KMS.imported['PassiveSkill'])
    {
        this.invalidatePassiveSkillCache();
    }
};

/**
 * オーブのセット先として使用する装備品を取得
 */
Game_Actor.prototype.getFirstEquipmentForAbilityOrbSlot = function(type)
{
    console.assert(type === 'weapon' || type === 'armor', 'Invalid equipment type');

    // 最もスロット数が多い装備を使用
    var items = (type === 'weapon' ? this.weapons() : this.armors());
    var candidate = { index: -1, count: 0 };
    for (var i = 0; i < items.length; i++)
    {
        var slotInfo = getEquipmentAbilityOrbSlotInfo(items[i]);
        if (slotInfo.count > candidate.count)
        {
            candidate.index = i;
            candidate.count = slotInfo.count;
        }
    }

    if (candidate.index >= 0)
    {
        return items[candidate.index];
    }
    else
    {
        return null;
    }
};

/**
 * 武器のオーブ装備可能数
 */
Game_Actor.prototype.weaponAbilityOrbSlotInfo = function()
{
    var weapon = this.getFirstEquipmentForAbilityOrbSlot('weapon');
    if (weapon)
    {
        return getEquipmentAbilityOrbSlotInfo(weapon);
    }
    else
    {
        return { count: 0, connect: 0 };
    }
};

/**
 * 防具のオーブ装備可能数
 */
Game_Actor.prototype.armorAbilityOrbSlotInfo = function()
{
    var armor = this.getFirstEquipmentForAbilityOrbSlot('armor');
    if (armor)
    {
        return getEquipmentAbilityOrbSlotInfo(armor);
    }
    else
    {
        return { count: 0, connect: 0 };
    }
};

/**
 * オーブ装備可能数 (装備タイプ指定)
 */
Game_Actor.prototype.abilityOrbSlotInfoByType = function(equipType)
{
    switch (equipType)
    {
    case Const.equipType.weapon:
        return this.weaponAbilityOrbSlotInfo();
    case Const.equipType.armor:
        return this.armorAbilityOrbSlotInfo();
    default:
        console.assert(false, 'Invalid equipment type.');
        return null;
    }
};

/**
 * 武器に装備しているオーブ
 */
Game_Actor.prototype.weaponAbilityOrbs = function()
{
    if (this._weaponAbilityOrbs == null)
    {
        this._weaponAbilityOrbs = [];
    }

    return this._weaponAbilityOrbs;
};

/**
 * 防具に装備しているオーブ
 */
Game_Actor.prototype.armorAbilityOrbs = function()
{
    if (this._armorAbilityOrbs == null)
    {
        this._armorAbilityOrbs = [];
    }

    return this._armorAbilityOrbs;
};

/**
 * 装備しているオーブ (装備タイプ指定)
 */
Game_Actor.prototype.abilityOrbsByType = function(equipType)
{
    switch (equipType)
    {
    case Const.equipType.weapon:
        return this.weaponAbilityOrbs();
    case Const.equipType.armor:
        return this.armorAbilityOrbs();
    default:
        console.assert(false, 'Invalid equipment type.');
        return null;
    }
};

/**
 * 装備しているすべてのオーブ
 */
Game_Actor.prototype.allAbilityOrbs = function()
{
    // 未装備箇所は除く
    return this.weaponAbilityOrbs()
        .concat(this.armorAbilityOrbs())
        .filter(function(orb)
        {
            return orb != null;
        });
};

/**
 * 指定したオーブと連結されているオーブを取得
 */
Game_Actor.prototype.findPairedAbilityOrb = function(orb)
{
    // 連結オーブを探す
    function findPair(equipType)
    {
        var orbs = this.abilityOrbsByType(equipType);
        var slotInfo = this.abilityOrbSlotInfoByType(equipType);
        for (var i = 0; i < orbs.length && i < slotInfo.connect * 2; i++)
        {
            if (orbs[i] !== orb)
            {
                continue;
            }

            if (i % 2 == 0)
            {
                // 偶数番目は右隣を取得
                return orbs[i + 1];
            }
            else
            {
                // 奇数番目は左隣を取得
                return orbs[i - 1];
            }
        }

        return null;
    }

    var pairedOrb = findPair.call(this, 'weapon');
    if (pairedOrb != null)
    {
        return pairedOrb;
    }

    return findPair.call(this, 'armor');
};

/**
 * オーブの装備変更可否
 */
Game_Actor.prototype.isAbilityOrbChangeOk = function(slotId)
{
    // TODO: オーブのロック対応
    return true;
};

/**
 * オーブの装備
 *
 * @param {String}  type        装備タイプ (weapon / armor)
 * @param {Number}  slotIndex   装備先のスロット番号
 * @param {object}  orb         装備するオーブ。null で解除
 * @param {Boolean} autoGain    元々装備していたオーブを自動でリストに加える。
 *                              装備画面ではリストの適切な位置に戻すため、false にする。
 *
 * @return 元々装備していたオーブ
 */
Game_Actor.prototype.equipAbilityOrb = function(type, slotIndex, orb, autoGain)
{
    if (autoGain == null)
    {
        autoGain = true;
    }

    var orbs     = this.abilityOrbsByType(type);
    var slotInfo = this.abilityOrbSlotInfoByType(type);
    if (orbs == null || slotInfo == null)
    {
        // 不正なタイプ指定
        return null;
    }

    var prevEquippedOrb = orbs[slotIndex];
    if (autoGain && prevEquippedOrb != null)
    {
        // 元々装備していたオーブをリストに戻す
        $gameParty.gainAbilityOrb(prevEquippedOrb);
    }

    if (orb != null && slotIndex < slotInfo.count)
    {
        orbs[slotIndex] = orb;

        // 装備したオーブをリストから除去
        $gameParty.loseAbilityOrb(orb);
    }
    else
    {
        // 範囲外のスロットを選択した場合は強制解除
        orbs[slotIndex] = null;
    }

    // オーブ補正の再計算が必要
    this.invalidateAbilityOrbParameterRevs();

    return prevEquippedOrb;
}

/**
 * オーブの装備解除
 *
 * @param {String} type         装備タイプ (weapon / armor)
 * @param {Number} slotIndex    装備先のスロット番号
 *
 * @return 元々装備していたオーブ
 */
Game_Actor.prototype.releaseAbilityOrb = function(type, slotIndex)
{
    return this.equipAbilityOrb(type, slotIndex, null, true);
};

/**
 * 全てのオーブを装備解除
 */
Game_Actor.prototype.releaseAllAbilityOrb = function()
{
    var types = [Const.equipType.weapon, Const.equipType.armor];
    types.forEach(function(type)
    {
        for (var i = 0; i < Const.slotCountMax; i++)
        {
            this.releaseAbilityOrb(type, i);
        }
    }, this);
};

/**
 * スロットを超過した分のオーブを外す
 */
Game_Actor.prototype.releaseExcessOrbs = function()
{
    // 指定した装備タイプの超過スロット分のオーブを外す
    function releaseExcess(type, slots)
    {
        for (var i = slots; i < Const.slotCountMax; i++)
        {
            this.releaseAbilityOrb(type, i);
        }
    }

    releaseExcess.call(this, 'weapon', this.weaponAbilityOrbSlotInfo().count);
    releaseExcess.call(this, 'armor',  this.armorAbilityOrbSlotInfo().count);
}

/**
 * AP の獲得
 */
Game_Actor.prototype.gainAp = function(ap, showLevelUp)
{
    var needsRefresh = false;

    function gain(orbs, type)
    {
        compactArray(orbs).forEach(function(orb)
        {
            var prevLevel = orb.level;
            orb.gainAp(ap, this.finalApRate(type));

            if (showLevelUp && orb.level > prevLevel)
            {
                this.displayAbilityOrbLevelUp(orb);
                if (orb.increased)
                {
                    this.displayAbilityOrbIncrease(orb);
                }
            }

            needsRefresh |= (orb.level !== prevLevel);
        }, this);
    }

    gain.call(this, this.weaponAbilityOrbs(), Const.equipType.weapon);
    gain.call(this, this.armorAbilityOrbs(),  Const.equipType.armor);

    // レベルが変化した場合はオーブ補正の再計算が必要
    if (needsRefresh)
    {
        this.invalidateAbilityOrbParameterRevs();
    }
};

/**
 * AP 獲得率
 *
 * @param {String} type     装備の種類 (weapon / armor)
 */
Game_Actor.prototype.finalApRate = function(type)
{
    return 1;
};

/**
 * オーブのレベルアップ表示
 *
 * @param {object} orb  メッセージ表示対象のオーブ
 */
Game_Actor.prototype.displayAbilityOrbLevelUp = function(orb)
{
    var text = TextManager.abilityOrbLevelUp.format(
        this._name,
        TextManager.abilityOrb,
        orb.name,
        TextManager.level,
        orb.level);
    $gameMessage.newPage();
    $gameMessage.add(text);
};

/**
 * オーブの増殖表示
 *
 * @param {object} orb  メッセージ表示対象のオーブ
 */
Game_Actor.prototype.displayAbilityOrbIncrease = function(orb)
{
    var text = TextManager.abilityOrbIncrease.format(
        TextManager.abilityOrb,
        orb.name);

    // レベルアップに続けて表示するので、改ページはしない
    $gameMessage.add(text);
};


//-----------------------------------------------------------------------------
// Game_Enemy

var _KMS_Game_Enemy_setup = Game_Enemy.prototype.setup;
Game_Enemy.prototype.setup = function(enemyId, x, y)
{
    _KMS_Game_Enemy_setup.call(this, enemyId, x, y);

    this.enemy().ap = getEnemyAp(enemyId);
};

/**
 * 取得できる AP
 */
Game_Enemy.prototype.ap = function()
{
    return this.enemy().ap;
};


//-----------------------------------------------------------------------------
// Game_Party

// 所持アイテムの初期化
var _KMS_Game_Party_initAllItems = Game_Party.prototype.initAllItems;
Game_Party.prototype.initAllItems = function()
{
    _KMS_Game_Party_initAllItems.call(this);

    this.clearAbilityOrb();
};

// アイテム所持数の取得
var _KMS_Game_Party_numItems = Game_Party.prototype.numItems;
Game_Party.prototype.numItems = function(item)
{
    if (DataManager.isAbilityOrb(item))
    {
        if (item instanceof Game_AbilityOrb)
        {
            // オーブの実体は個別所持扱いなので常に 1 個
            return this.abilityOrbs().orbs.contains(item) ? 1 : 0;
        }
        else
        {
            // オーブデータの場合は同一 ID の所持数
            return this.abilityOrbs().numberByIds(item.id);
        }
    }
    else
    {
        return _KMS_Game_Party_numItems.call(this, item);
    }
};

/**
 * 所持しているオーブ一覧
 */
Game_Party.prototype.abilityOrbs = function()
{
    if (this._abilityOrbs == null)
    {
        this._abilityOrbs = new Game_AbilityOrbList();
    }

    return this._abilityOrbs;
};

/**
 * オーブの取得
 */
Game_Party.prototype.gainAbilityOrb = function(orb)
{
    this.abilityOrbs().gain(orb);
}

/**
 * オーブの破棄
 */
Game_Party.prototype.loseAbilityOrb = function(orb)
{
    this.abilityOrbs().lose(orb);
}

/**
 * 指定した ID のオーブを取得
 */
Game_Party.prototype.gainAbilityOrbById = function(orbId, level)
{
    return this.abilityOrbs().gainById(orbId, level);
}

/**
 * 指定した ID のオーブを破棄
 */
Game_Party.prototype.loseAbilityOrbById = function(orbId, number)
{
    this.abilityOrbs().loseById(orbId, number);
}

/**
 * 所持しているオーブのクリア
 */
Game_Party.prototype.clearAbilityOrb = function()
{
    this.abilityOrbs().clear();
}

/**
 * メンバーのオーブ補正キャッシュを無効化
 */
Game_Party.prototype.invalidateAbilityOrbParameterRevs = function()
{
    this.allMembers().forEach(function(actor)
    {
        actor.invalidateAbilityOrbParameterRevs();
    }, this);
};

var _KMS_Game_Party_addActor = Game_Party.prototype.addActor;
Game_Party.prototype.addActor = function(actorId)
{
    _KMS_Game_Party_addActor.call(this, actorId);

    // 加入したアクターのオーブ補正キャッシュを無効化
    $gameActors.actor(actorId).invalidateAbilityOrbParameterRevs();
};


//-----------------------------------------------------------------------------
// Game_Troop

/**
 * 取得できる AP
 */
Game_Troop.prototype.apTotal = function()
{
    return this.deadMembers().reduce(function(r, enemy)
    {
        return r + enemy.ap();
    }, 0);
};


//-----------------------------------------------------------------------------
// Game_Interpreter

/**
 * 店に陳列するオーブの設定
 *
 * 可変引数で ID リストが渡される仕様。
 */
Game_Interpreter.prototype.setKmsShopAbilityOrbs = function()
{
    var orbList   = [];
    var goodsArgs = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
    goodsArgs.forEach(function(goods)
    {
        var id;
        var price;
        if (goods instanceof Array)
        {
            // 配列指定の場合は [ID, 価格] と見なす
            id    = goods[0];
            price = goods[1];
        }
        else
        {
            id = goods;
        }

        var orb = $dataKmsAbilityOrbs.orbs[id];
        if (orb != null)
        {
            if (price == null)
            {
                // 価格指定がない場合はレベル 1 の価格を使用する
                price = orb.levels[0].price;
            }
            orbList.push([Const.abilityOrbShopCategory, id, 1, price]);
        }
    });

    $gameTemp.shopAbilityOrbs = orbList;
};


//-----------------------------------------------------------------------------
// Window_Base

var _KMS_Window_Base_drawItemName = Window_Base.prototype.drawItemName;
Window_Base.prototype.drawItemName = function(item, x, y, width)
{
    if (DataManager.isAbilityOrb(item))
    {
        this.drawAbilityOrbName(item, x, y, width);
    }
    else
    {
        _KMS_Window_Base_drawItemName.call(this, item, x, y, width);
    }
};

/**
 * オーブアイコンの描画
 */
Window_Base.prototype.drawAbilityOrbIcon = function(orb, x, y)
{
    if (orb)
    {
        this.drawIcon(orb.iconIndex, x, y);
    }
};

/**
 * オーブ名の描画
 */
Window_Base.prototype.drawAbilityOrbName = function(orb, x, y, width)
{
    width = width || 312;
    if (!orb)
    {
        return;
    }

    this.drawAbilityOrbIcon(orb, x + 2, y + 2);

    var iconBoxWidth = Window_Base._iconWidth + 4;
    this.resetTextColor();
    this.drawText(orb.name, x + iconBoxWidth, y, width - iconBoxWidth);
};


//-----------------------------------------------------------------------------
// Window_MenuCommand

var _KMS_Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
Window_MenuCommand.prototype.addOriginalCommands = function()
{
    _KMS_Window_MenuCommand_addOriginalCommands.call(this);

    var enabled = this.areMainCommandsEnabled();
    this.addCommand(TextManager.abilityOrbCommand, Const.menuCommandKey, enabled);
};


//-----------------------------------------------------------------------------
// Window_ItemCategory

var _KMS_Window_ItemCategory_makeCommandList = Window_ItemCategory.prototype.makeCommandList;
Window_ItemCategory.prototype.makeCommandList = function()
{
    _KMS_Window_ItemCategory_makeCommandList.call(this);

    this.addCommand(TextManager.abilityOrb, Const.itemCategoryKey);
};


//-----------------------------------------------------------------------------
// Window_ItemList

var _KMS_Window_ItemList_includes = Window_ItemList.prototype.includes;
Window_ItemList.prototype.includes = function(item)
{
    if (this._category === Const.itemCategoryKey)
    {
        return DataManager.isAbilityOrb(item);
    }
    else
    {
        return _KMS_Window_ItemList_includes.call(this, item);
    }
};

var _KMS_Window_ItemList_makeItemList = Window_ItemList.prototype.makeItemList;
Window_ItemList.prototype.makeItemList = function()
{
    _KMS_Window_ItemList_makeItemList.call(this);

    var orbs = $gameParty.abilityOrbs().orbs;
    if (this.includes(null))
    {
        this._data.pop();
    }

    // オーブを追加
    this._data = this._data.concat(orbs.filter(function(item)
    {
        return this.includes(item);
    }, this));

    if (this.includes(null))
    {
        this._data.push(null);
    }
};


//-----------------------------------------------------------------------------
// Window_AbilityOrbCommand
//
// オーブ装備画面のコマンドウィンドウ。

function Window_AbilityOrbCommand()
{
    this.initialize.apply(this, arguments);
}

Window_AbilityOrbCommand.prototype = Object.create(Window_Command.prototype);
Window_AbilityOrbCommand.prototype.constructor = Window_AbilityOrbCommand;

Window_AbilityOrbCommand.prototype.initialize = function(x, y, width)
{
    this._windowWidth = width;
    Window_Command.prototype.initialize.call(this, x, y);
};

Window_AbilityOrbCommand.prototype.windowWidth = function()
{
    return this._windowWidth;
};

Window_AbilityOrbCommand.prototype.makeCommandList = function()
{
    this.addCommand(Params.sortName + ': ' + TextManager.abilityOrbSortByCategory, Const.sortKey.category);
    this.addCommand(Params.sortName + ': ' + TextManager.abilityOrbSortByName,     Const.sortKey.name);
    this.addCommand(Params.sortName + ': ' + TextManager.abilityOrbSortByLevel,    Const.sortKey.level);
    this.addCommand(Params.sortName + ': ' + TextManager.abilityOrbSortByAp,       Const.sortKey.ap);

    this.addCommand(TextManager.clear, 'clear');
};

var _KMS_Window_AbilityOrbCommand_playOkSound = Window_AbilityOrbCommand.prototype.playOkSound;
Window_AbilityOrbCommand.prototype.playOkSound = function()
{
    if (this.currentSymbol() === 'clear')
    {
        // 全解除の場合は決定音を鳴らさない
    }
    else
    {
        _KMS_Window_AbilityOrbCommand_playOkSound.call(this);
    }
};


//-----------------------------------------------------------------------------
// Window_AbilityOrbStatus
//
// オーブ装備画面のステータスウィンドウ。

function Window_AbilityOrbStatus()
{
    this.initialize.apply(this, arguments);
}

Window_AbilityOrbStatus.prototype = Object.create(Window_Base.prototype);
Window_AbilityOrbStatus.prototype.constructor = Window_AbilityOrbStatus;

Window_AbilityOrbStatus.prototype.initialize = function(x, y, width)
{
    Window_Base.prototype.initialize.call(this, x, y, width, this.windowHeight());
    this._actor = null;
};

Window_AbilityOrbStatus.prototype.windowHeight = function()
{
    return this.fittingHeight(4);
};

Window_AbilityOrbStatus.prototype.setActor = function(actor)
{
    if (this._actor !== actor)
    {
        this._actor = actor;
        this.refresh();
    }
};

Window_AbilityOrbStatus.prototype.refresh = function()
{
    this.contents.clear();
    if (!this._actor)
    {
        return;
    }

    var w = this.width - this.padding * 2;
    var h = this.height - this.padding * 2;
    this.drawActorStatus(0, 0, w, h);
};

Window_AbilityOrbStatus.prototype.drawActorStatus = function(x, y, width, height)
{
    this.drawActorFace(this._actor, x, y, 144, height);

    var x2 = x + 160;
    var lineHeight = this.lineHeight();
    var width2 = Math.min(200, width - 180 - this.textPadding());
    this.drawActorName(this._actor, x2, y);
    this.drawActorLevel(this._actor, x2, y + lineHeight * 1);
    this.drawActorHp(this._actor, x2, y + lineHeight * 2, width2);
    this.drawActorMp(this._actor, x2, y + lineHeight * 3, width2);
};


//-----------------------------------------------------------------------------
// Window_AbilityOrbInfo
//
// オーブ装備画面のオーブ情報ウィンドウ。

function Window_AbilityOrbInfo()
{
    this.initialize.apply(this, arguments);
}

Window_AbilityOrbInfo.prototype = Object.create(Window_Base.prototype);
Window_AbilityOrbInfo.prototype.constructor = Window_AbilityOrbInfo;

Window_AbilityOrbInfo.prototype.initialize = function(x, y, width, height)
{
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._orb = null;
};

Window_AbilityOrbInfo.prototype.setOrb = function(orb)
{
    if (this._orb !== orb)
    {
        this._orb = orb;
        this.refresh();
    }
};

Window_AbilityOrbInfo.prototype.refresh = function()
{
    this.contents.clear();
    if (!this._orb)
    {
        return;
    }

    var w = this.width - this.padding * 2;
    var h = this.height - this.padding * 2;
    this.drawOrbInfo(this._orb, 0, 0, w, h);
};

Window_AbilityOrbInfo.prototype.drawOrbInfo = function(orb, x, y, width, height)
{
    var halfWidth  = width / 2;
    var thirdWidth = width / 3;
    var x2 = x + halfWidth;

    this.makeFontSmaller();
    this.drawAbilityOrbName(orb, x, y, halfWidth);
    this.drawOrbInfoLevel(orb, x2, y, halfWidth);

    var dy = y + this.lineHeight();

    this.drawOrbInfoElements(orb, x, dy + this.lineHeight() / 4, thirdWidth);
    dy += this.drawOrbInfoAp(orb, x + thirdWidth, dy, thirdWidth * 2);
    this.drawOrbInfoSkills(orb, x, dy, halfWidth, height - dy);
    this.drawOrbInfoParameters(orb, x2, dy, halfWidth, height - dy);

    this.resetFontSettings();
};

Window_AbilityOrbInfo.prototype.drawOrbInfoLevel = function(orb, x, y, width)
{
    var text = Array(orb.level + 1).join('★');
    text += Array(orb.maxLevel() - orb.level + 1).join('☆');

    this.makeFontBigger();
    this.changeTextColor(this.textColor(orb.category.textColor));
    this.drawText(text, x, y, width, 'right');
    this.changeTextColor(this.normalColor());
    this.makeFontSmaller();
};

Window_AbilityOrbInfo.prototype.drawOrbInfoElements = function(orb, x, y, width)
{
    this.makeFontBigger();
    this.changeTextColor(this.textColor(Params.elementTextColor));

    var dx = 0;
    orb.getElements().forEach(function(element)
    {
        var elementName = $dataSystem.elements[element];
        if (!elementName)
        {
            return;
        }

        var textWidth = this.textWidth($dataSystem.elements[element]);
        if (dx + textWidth > width)
        {
            return;
        }

        this.drawText(elementName, x + dx, y, textWidth + 8);
        dx += textWidth + 8;
    }, this);

    this.changeTextColor(this.normalColor());
    this.makeFontSmaller();
};

Window_AbilityOrbInfo.prototype.drawOrbInfoAp = function(orb, x, y, width)
{
    var lineHeight = this.contents.fontSize + 8;

    var apWidth = 96;
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.ap, x, y, width - apWidth, 'right');
    this.drawText(TextManager.expNext.format(TextManager.level), x, y + lineHeight, width - apWidth, 'right');

    var numX = x + width - apWidth - 4;
    this.changeTextColor(this.normalColor());

    var currentAp;
    var nextAp;
    if (orb.isMaxLevel())
    {
        currentAp = Params.masterLevelApText;
        nextAp    = 0;
    }
    else
    {
        currentAp = orb.currentAp();
        nextAp    = orb.nextRequiredAp();
    }
    this.drawText(currentAp, numX, y, apWidth, 'right');
    this.drawText(nextAp, numX, y + lineHeight, apWidth, 'right');

    return lineHeight * 2;
};

Window_AbilityOrbInfo.prototype.drawOrbInfoSkills = function(orb, x, y, width, height)
{
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.abilityOrbSkillList, x, y, width);
    this.changeTextColor(this.normalColor());

    var dy = y + this.lineHeight();
    orb.getSkills().forEach(function(skillId)
    {
        var skill = $dataSkills[skillId];
        if (skill)
        {
            this.drawItemName(skill, x, dy, width);
            dy += this.lineHeight();
        }
    }, this);
};

// 値の文字色
Window_AbilityOrbInfo.prototype.getValueColor = function(value)
{
    return value > 0 ? Params.upTextColor : Params.downTextColor;
};

// 値に +/- を付与したテキスト
Window_AbilityOrbInfo.prototype.getPlusText = function(value)
{
    return (value > 0 ? '+' : '') + value;
};

// 割合表記
Window_AbilityOrbInfo.prototype.getRateText = function(value)
{
    var rate = value - 1;
    return (rate > 0 ? '+' : '') + Math.round(rate * 100) + '%';
};

Window_AbilityOrbInfo.prototype.drawOrbInfoParameters = function(orb, x, y, width, height)
{
    var lineHeight = this.contents.fontSize + 8;

    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.abilityOrbEffects, x, y, width);
    this.changeTextColor(this.normalColor());

    var dx = x + 16;
    var dy = y + lineHeight;
    var valueWidth = 48;
    var nameWidth  = width - valueWidth - (dx - x) - 8;
    var valueX = dx + nameWidth + 4;
    var params = orb.getParameters();
    for (var i = 0; i < params.plus.length; i++)
    {
        if (params.plus[i] !== 0)
        {
            this.drawText(TextManager.param(i), dx, dy, nameWidth);
            this.changeTextColor(this.textColor(this.getValueColor(params.plus[i])));
            this.drawText(this.getPlusText(params.plus[i]), valueX, dy, valueWidth, 'right');
            this.changeTextColor(this.normalColor());
            dy += lineHeight;
        }
        if (params.rate[i] !== 1)
        {
            this.drawText(TextManager.param(i), dx, dy, nameWidth);
            this.changeTextColor(this.textColor(this.getValueColor(params.rate[i] - 1)));
            this.drawText(this.getRateText(params.rate[i]), valueX, dy, valueWidth, 'right');
            this.changeTextColor(this.normalColor());
            dy += lineHeight;
        }
    }

    // 表示領域が残っていれば連結効果を描画
    var remainHeight = height - (dy - y);
    if (remainHeight > lineHeight)
    {
        this.drawOrbInfoPairEffects(orb, x, dy, width, remainHeight);
    }
};

Window_AbilityOrbInfo.prototype.drawOrbInfoPairEffects = function(orb, x, y, width, height)
{
    function drawPairEffect(effect, x, y, width)
    {
        var dx = x + 16;
        var valueWidth = 48;
        var nameWidth  = width - valueWidth - (dx - x) - 8;
        var valueX = dx + nameWidth + 4;

        switch (effect.code)
        {
        case Const.pairEffectCode.enableElement:
            // 属性付与
            //  引数 : 有効率
            this.drawText(Params.pairEffectName.element, dx, y, nameWidth);
            this.changeTextColor(this.textColor(this.getValueColor(1 - effect.argument)));
            this.drawText(this.getRateText(2 - effect.argument), valueX, dy, valueWidth, 'right');
            break;
        case Const.pairEffectCode.enableState:
            // 付与ステート
            //  引数 : 付与率
            this.drawText(Params.pairEffectName.state, dx, y, nameWidth);
            this.changeTextColor(this.textColor(this.getValueColor(1 - effect.argument)));
            this.drawText(this.getRateText(2 - effect.argument), valueX, dy, valueWidth, 'right');
            break;
        case Const.pairEffectCode.flexibleScope:
            // 全体化
            //  引数 : なし
            this.drawText(Params.pairEffectName.flexibleScope, dx, y, nameWidth);
            break;
        default:
            break;
        }

        this.changeTextColor(this.normalColor());
    }

    var lineHeight = this.contents.fontSize + 8;
    var dy = y;

    orb.getPairEffects().forEach(function(effect)
    {
        drawPairEffect.call(this, effect, x, dy, width);
        dy += lineHeight;
    }, this);
};


//-----------------------------------------------------------------------------
// Window_AbilityOrbSlot
//
// オーブのスロットを選択するウィンドウ。

function Window_AbilityOrbSlot()
{
    this.initialize.apply(this, arguments);
}

Window_AbilityOrbSlot.prototype = Object.create(Window_Selectable.prototype);
Window_AbilityOrbSlot.prototype.constructor = Window_AbilityOrbSlot;

Window_AbilityOrbSlot.prototype.initialize = function(x, y, width, height)
{
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._actor = null;
    this._data  = [];
    this.refresh();
};

Window_AbilityOrbSlot.prototype.setActor = function(actor)
{
    if (this._actor !== actor)
    {
        this._actor = actor;
        this.refresh();
        this.normalizeCursorIndex();
    }
};

Window_AbilityOrbSlot.prototype.update = function()
{
    Window_Selectable.prototype.update.call(this);
};

Window_AbilityOrbSlot.prototype.maxCols = function()
{
    return Const.slotCountMax;
};

Window_AbilityOrbSlot.prototype.spacing = function()
{
    return 8;
};

Window_AbilityOrbSlot.prototype.maxItems = function()
{
    // 最大項目数は固定 (カーソル位置は独自制御する)
    return Const.slotCountMax * 2;
};

Window_AbilityOrbSlot.prototype.isHorizontal = function()
{
    return true;
};

Window_AbilityOrbSlot.prototype.itemRect = function(index)
{
    var rect = Window_Selectable.prototype.itemRect.call(this, index);

    // 装備名の位置をスキップする
    rect.y += this.lineHeight() * (index < Const.slotCountMax ? 1 : 2);
    return rect;
};

/**
 * カーソル下移動
 */
Window_AbilityOrbSlot.prototype.cursorDown = function(wrap)
{
    var prevIndex = this.index();

    Window_Selectable.prototype.cursorDown.call(this, wrap);

    var slots = this.selectedEquipTypeSlotCount().count;
    if (slots <= 0)
    {
        // スロットがない場合は直前の位置に戻す
        this.select(prevIndex);
    }
    else
    {
        this.normalizeCursorIndex();
    }
};

/**
 * カーソル上移動
 */
Window_AbilityOrbSlot.prototype.cursorUp = function(wrap)
{
    var prevIndex = this.index();

    Window_Selectable.prototype.cursorUp.call(this, wrap);

    var slots = this.selectedEquipTypeSlotCount().count;
    if (slots <= 0)
    {
        // スロットがない場合は直前の位置に戻す
        this.select(prevIndex);
    }
    else
    {
        this.normalizeCursorIndex();
    }
};

/**
 * カーソル右移動
 */
Window_AbilityOrbSlot.prototype.cursorRight = function(wrap)
{
    if (this.maxCols() < 2)
    {
        Window_Selectable.prototype.cursorRight.call(this, wrap);
        return;
    }

    var index = this.selectedSlotIndex();
    var slots = this.selectedEquipTypeSlotCount().count;
    if (index < slots - 1)
    {
        this.select(this.index() + 1);
    }
    else if (wrap)
    {
        if (slots <= 0)
        {
            this.reselect();
        }
        else
        {
            // 同じ装備内でループ
            this.select(this.index() - slots + 1);
        }
    }
};

/**
 * カーソル左移動
 */
Window_AbilityOrbSlot.prototype.cursorLeft = function(wrap)
{
    if (this.maxCols() < 2)
    {
        Window_Selectable.prototype.cursorLeft.call(this, wrap);
        return;
    }

    var index = this.selectedSlotIndex();
    var slots = this.selectedEquipTypeSlotCount().count;
    if (index > 0)
    {
        this.select(this.index() - 1);
    }
    else if (wrap)
    {
        if (slots <= 0)
        {
            this.reselect();
        }
        else
        {
            // 同じ装備内でループ
            this.select(this.index() + slots - 1);
        }
    }
};

/**
 * カーソル位置の正規化
 */
Window_AbilityOrbSlot.prototype.normalizeCursorIndex = function()
{
    var slotIndex = this.selectedSlotIndex();
    var slots     = this.selectedEquipTypeSlotCount().count;
    if (slots <= 0)
    {
        // もう一方にスロットがあればその先頭、ない場合は武器の先頭位置へ
        this.select(this.index() < Const.slotCountMax ? Const.slotCountMax : 0);
        if (this.selectedEquipTypeSlotCount().count <= 0)
        {
            this.select(0);
        }
    }
    else if (slotIndex >= slots)
    {
        this.select(this.index() - (slots - slotIndex + 1));
    }

    this.updateHelp();
};

/**
 * 装備タイプの取得
 */
Window_AbilityOrbSlot.prototype.equipType = function(index)
{
    return index < Const.slotCountMax ? Const.equipType.weapon : Const.equipType.armor;
};

/**
 * 選択している装備タイプの取得
 */
Window_AbilityOrbSlot.prototype.selectedEquipType = function()
{
    return this.equipType(this.index());
};

/**
 * 選択している装備タイプのスロット数を取得
 */
Window_AbilityOrbSlot.prototype.selectedEquipTypeSlotCount = function()
{
    if (!this._actor)
    {
        return 0;
    }

    return this._actor.abilityOrbSlotInfoByType(this.selectedEquipType());
};

/**
 * オーブスロット番号の取得
 */
Window_AbilityOrbSlot.prototype.slotIndex = function(index)
{
    return index % Const.slotCountMax;
};

/**
 * 選択しているオーブスロット番号の取得
 */
Window_AbilityOrbSlot.prototype.selectedSlotIndex = function()
{
    return this.slotIndex(this.index());
};

/**
 * _data に入れるためのオーブスロットの一覧を生成
 */
Window_AbilityOrbSlot.prototype.createOrbSlotList = function()
{
    var orbs = new Array(this.maxItems());
    if (this._actor)
    {
        function setOrbs(startIndex, equippedOrbs)
        {
            for (var i = 0; i < Const.slotCountMax; i++)
            {
                orbs[startIndex + i] = equippedOrbs[i];
            }
        }

        setOrbs(0, this._actor.weaponAbilityOrbs());
        setOrbs(Const.slotCountMax, this._actor.armorAbilityOrbs());
    }

    return orbs;
};

Window_AbilityOrbSlot.prototype.item = function()
{
    if (this._actor)
    {
        return this._data[this.index()];
    }
    else
    {
        return null;
    }
};

Window_AbilityOrbSlot.prototype.refresh = function()
{
    this.contents.clear();

    this._data = this.createOrbSlotList();
    if (!this._actor)
    {
        return;
    }

    var lineHeight = this.lineHeight();
    var equips = this._actor.equips();
    this.drawItemName(equips[0], 4, 0);
    this.drawItemName(equips[1], 4, lineHeight * 2);

    for (var i = 0; i < this.maxItems(); i++)
    {
        this.drawItem(i);
    }
};

Window_AbilityOrbSlot.prototype.drawItem = function(index)
{
    var rect = this.itemRectForText(index);
    rect.x -= 2;
    rect.y += 2;

    if (!this._actor)
    {
        return;
    }

    var slotIndex = this.slotIndex(index);

    // 存在しないスロットは描画しない
    var slotInfo = this._actor.abilityOrbSlotInfoByType(this.equipType(index));
    if (slotIndex >= slotInfo.count)
    {
        return;
    }

    // 連結スロットの場合は先に連結線を描画
    if (slotIndex % 2 === 0 && slotIndex < slotInfo.connect * 2)
    {
        var rect2 = this.itemRectForText(slotIndex + 1);
        this.contents.fillRect(
            rect.x + rect.width / 2,
            rect.y + rect.height / 2 - 6,
            rect2.x - rect.x,
            6,
            'lightsteelblue');
    }

    var orb = this._data[index];
    if (orb == null || Params.alwaysDrawEmptySlot)
    {
        this.drawIcon(Params.emptySlotIcon, rect.x, rect.y);
    }

    if (orb != null)
    {
        this.drawAbilityOrbIcon(this._data[index], rect.x, rect.y);
    }
};

Window_AbilityOrbSlot.prototype.isEnabled = function(index)
{
    var slotInfo = this._actor.abilityOrbSlotInfoByType(this.equipType(index));
    return this.slotIndex(index) < slotInfo.count;
};

Window_AbilityOrbSlot.prototype.isCurrentItemEnabled = function()
{
    return this.isEnabled(this.index());
};

Window_AbilityOrbSlot.prototype.setInfoWindow = function(infoWindow)
{
    this._infoWindow = infoWindow;
    this.callUpdateHelp();
};

Window_AbilityOrbSlot.prototype.updateHelp = function()
{
    Window_Selectable.prototype.updateHelp.call(this);
    this.setHelpWindowItem(this.item());
    if (this._infoWindow)
    {
        this._infoWindow.setOrb(this.item());
    }
};

Window_AbilityOrbSlot.prototype.processHandling = function()
{
    if (this.isOpenAndActive())
    {
        // 各ボタンに対応するハンドラの実行
        [Params.buttonForOpenCommand, Params.buttonForReleaseOrb]
        .forEach(function(button)
        {
            if (this.isHandled(button) && Input.isTriggered(button))
            {
                this.playOkSound();
                this.callHandler(button);
            }
        }, this);
    }

    Window_Selectable.prototype.processHandling.call(this);
};


//-----------------------------------------------------------------------------
// Window_AbilityOrbList
//
// オーブ装備画面でオーブ一覧を表示するウィンドウ。

function Window_AbilityOrbList()
{
    this.initialize.apply(this, arguments);
}

Window_AbilityOrbList.prototype = Object.create(Window_Selectable.prototype);
Window_AbilityOrbList.prototype.constructor = Window_AbilityOrbList;

Window_AbilityOrbList.prototype.initialize = function(x, y, width, height)
{
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._actor = null;
    this._data  = $gameParty.abilityOrbs();
};

Window_AbilityOrbList.prototype.setActor = function(actor)
{
    if (this._actor !== actor)
    {
        this._actor = actor;
        this.refresh();
        this.resetScroll();
    }
};

Window_AbilityOrbList.prototype.maxCols = function()
{
    return 1;
};

Window_AbilityOrbList.prototype.maxItems = function()
{
    return this._data ? this._data.length : 1;
};

Window_AbilityOrbList.prototype.item = function()
{
    return this._data && this.index() >= 0 ? this._data[this.index()] : null;
};

Window_AbilityOrbList.prototype.includes = function(item)
{
    return true;
};

Window_AbilityOrbList.prototype.isEnabled = function(item)
{
    return true;
};

Window_AbilityOrbList.prototype.makeItemList = function()
{
    // 末尾に装備解除用の null を入れる
    this._data = $gameParty.abilityOrbs().orbs.concat([null]);
};

Window_AbilityOrbList.prototype.selectLast = function()
{
};

Window_AbilityOrbList.prototype.drawItem = function(index)
{
    var orb = this._data[index];
    if (orb == null)
    {
        return;
    }

    var rect = this.itemRect(index);
    rect.width -= this.textPadding();

    var orb = this._data[index];
    this.drawAbilityOrbName(orb, rect.x, rect.y, rect.width);
};

Window_AbilityOrbList.prototype.setInfoWindow = function(infoWindow)
{
    this._infoWindow = infoWindow;
    this.callUpdateHelp();
};

Window_AbilityOrbList.prototype.updateHelp = function()
{
    this.setHelpWindowItem(this.item());
    if (this._infoWindow)
    {
        this._infoWindow.setOrb(this.item());
    }
};

Window_AbilityOrbList.prototype.playOkSound = function()
{
    // 決定音を鳴らさない
};

Window_AbilityOrbList.prototype.refresh = function()
{
    this.makeItemList();
    this.createContents();
    this.drawAllItems();
};


//-----------------------------------------------------------------------------
// Window_ShopBuy

var _KMS_Window_ShopBuy_makeItemList = Window_ShopBuy.prototype.makeItemList;
Window_ShopBuy.prototype.makeItemList = function()
{
    _KMS_Window_ShopBuy_makeItemList.call(this);

    // とりあえずオーブは末尾に追加
    this._shopGoods.forEach(function(goods)
    {
        if (goods[0] === Const.abilityOrbShopCategory)
        {
            var item = $dataKmsAbilityOrbs.orbs[goods[1]];
            this._data.push(item);
            this._price.push(goods[2] === 0 ? item.price : goods[3]);
        }
    }, this);
};


//-----------------------------------------------------------------------------
// Window_ShopStatus

var _KMS_Window_ShopStatus_refresh = Window_ShopStatus.prototype.refresh;
Window_ShopStatus.prototype.refresh = function()
{
    _KMS_Window_ShopStatus_refresh.call(this);

    if (this._item && this.isAbilityOrb())
    {
        var x = this.textPadding();
        if (this._item instanceof Game_AbilityOrb)
        {
            this.drawAbilityOrbInfo(this._item, x, this.lineHeight() * 2);
        }
        else
        {
            this.drawAbilityOrbBaseInfo(this._item, x, this.lineHeight() * 2);
        }
    }
};

/**
 * オーブ判定
 */
Window_ShopStatus.prototype.isAbilityOrb = function()
{
    return DataManager.isAbilityOrb(this._item);
};

/**
 * オーブの情報を描画
 */
Window_ShopStatus.prototype.drawAbilityOrbInfo = function(orb, x, y)
{
    var w = this.width - this.padding * 2 - x;
    var h = this.height - this.padding * 2 - y;

    this.makeFontSmaller();

    var proto = Window_AbilityOrbInfo.prototype;
    proto.drawOrbInfoLevel.call(this, orb, x, y, w);

    var dy = y + this.lineHeight();

    dy += proto.drawOrbInfoAp.call(this, orb, x, dy, w);

    this.resetFontSettings();
};

/**
 * オーブの基本情報を描画
 */
Window_ShopStatus.prototype.drawAbilityOrbBaseInfo = function(orb, x, y)
{
};


//-----------------------------------------------------------------------------
// Scene_Menu

var _KMS_Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function()
{
    _KMS_Scene_Menu_createCommandWindow.call(this);

    this._commandWindow.setHandler(Const.menuCommandKey, this.commandPersonal.bind(this));
};

var _KMS_Scene_Menu_onPersonalOk = Scene_Menu.prototype.onPersonalOk;
Scene_Menu.prototype.onPersonalOk = function()
{
    _KMS_Scene_Menu_onPersonalOk.call(this);

    if (this._commandWindow.currentSymbol() === Const.menuCommandKey)
    {
        SceneManager.push(Scene_AbilityOrb);
    }
};

//-----------------------------------------------------------------------------
// Scene_AbilityOrb
//
// オーブを装備するシーンクラス。

function Scene_AbilityOrb()
{
    this.initialize.apply(this, arguments);
}

Scene_AbilityOrb.prototype = Object.create(Scene_MenuBase.prototype);
Scene_AbilityOrb.prototype.constructor = Scene_AbilityOrb;

Scene_AbilityOrb.prototype.initialize = function()
{
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_AbilityOrb.prototype.create = function()
{
    Scene_MenuBase.prototype.create.call(this);
    this.createUpperWindowLayer();
    this.createHelpWindow();
    this.createStatusWindow();
    this.createOrbInfoWindow();
    this.createSlotWindow();
    this.createItemWindow();
    this.createCommandWindow();
    this.refreshActor();
};

/**
 * 上層ウィンドウレイヤーの作成
 */
Scene_AbilityOrb.prototype.createUpperWindowLayer = function() {
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight;
    var x = (Graphics.width - width) / 2;
    var y = (Graphics.height - height) / 2;
    this._upperWindowLayer = new WindowLayer();
    this._upperWindowLayer.move(x, y, width, height);
    this.addChild(this._upperWindowLayer);

    if (KMS.imported['CursorAnimation'])
    {
        this._animationCursor.addWindowLayer(this._upperWindowLayer);
    }
};

/**
 * ステータス表示ウィンドウの作成
 */
Scene_AbilityOrb.prototype.createStatusWindow = function()
{
    var wx = 0;
    var wy = this._helpWindow.height;
    var ww = Graphics.boxWidth;
    this._statusWindow = new Window_AbilityOrbStatus(wx, wy, ww);
    this.addWindow(this._statusWindow);
};

/**
 * オーブ情報ウィンドウの作成
 */
Scene_AbilityOrb.prototype.createOrbInfoWindow = function()
{
    var wx = 0;
    var wy = this._statusWindow.y + this._statusWindow.height;
    var ww = Graphics.boxWidth / 2;
    var wh = Graphics.boxHeight - wy;
    this._infoWindow = new Window_AbilityOrbInfo(wx, wy, ww, wh);
    this.addWindow(this._infoWindow);
};

/**
 * オーブスロットウィンドウの作成
 */
Scene_AbilityOrb.prototype.createSlotWindow = function()
{
    var wx = Graphics.boxWidth / 2;
    var wy = this._statusWindow.y;
    var ww = Graphics.boxWidth - wx;
    var wh = this._statusWindow.height;
    this._slotWindow = new Window_AbilityOrbSlot(wx, wy, ww, wh);
    this._slotWindow.opacity = 0;
    this._slotWindow.setHelpWindow(this._helpWindow);
    this._slotWindow.setInfoWindow(this._infoWindow);
    this._slotWindow.activate();
    this._slotWindow.select(0);
    this._slotWindow.setHandler('ok',       this.onSlotOk.bind(this));
    this._slotWindow.setHandler('pagedown', this.nextActor.bind(this));
    this._slotWindow.setHandler('pageup',   this.previousActor.bind(this));
    this._slotWindow.setHandler('cancel',   this.popScene.bind(this));
    this._slotWindow.setHandler(Params.buttonForOpenCommand, this.openCommand.bind(this));
    this._slotWindow.setHandler(Params.buttonForReleaseOrb,  this.releaseOrb.bind(this));
    this._upperWindowLayer.addChild(this._slotWindow);
};

/**
 * 所持オーブ一覧ウィンドウの作成
 */
Scene_AbilityOrb.prototype.createItemWindow = function()
{
    var wx = this._slotWindow.x;
    var wy = this._slotWindow.y + this._slotWindow.height;
    var ww = Graphics.boxWidth - wx;
    var wh = Graphics.boxHeight - wy;
    this._itemWindow = new Window_AbilityOrbList(wx, wy, ww, wh);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setInfoWindow(this._infoWindow);
    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this.addWindow(this._itemWindow);
};

/**
 * コマンドウィンドウの作成
 */
Scene_AbilityOrb.prototype.createCommandWindow = function()
{
    var ww = 320;
    this._commandWindow = new Window_AbilityOrbCommand(0, 0, ww);
    this._commandWindow.x = this._itemWindow.x - ww;
    this._commandWindow.y = (Graphics.boxHeight - this._commandWindow.height) / 2;
    this._commandWindow.openness = 0;
    this._commandWindow.setHelpWindow(this._helpWindow);
    this._commandWindow.deactivate();
    this._commandWindow.setHandler(Const.sortKey.category, this.commandSortByCategory.bind(this));
    this._commandWindow.setHandler(Const.sortKey.name,     this.commandSortByName.bind(this));
    this._commandWindow.setHandler(Const.sortKey.level,    this.commandSortByLevel.bind(this));
    this._commandWindow.setHandler(Const.sortKey.ap,       this.commandSortByAp.bind(this));

    this._commandWindow.setHandler('clear',  this.commandClear.bind(this));
    this._commandWindow.setHandler('cancel', this.onCommandCancel.bind(this));
    this._upperWindowLayer.addChild(this._commandWindow);
};

/**
 * アクター情報の再設定
 */
Scene_AbilityOrb.prototype.refreshActor = function()
{
    var actor = this.actor();
    this._statusWindow.setActor(actor);
    this._slotWindow.setActor(actor);
    this._itemWindow.setActor(actor);
};

/**
 * コマンドウィンドウを開く
 */
Scene_AbilityOrb.prototype.openCommand = function()
{
    this._slotWindow.deactivate();
    this._commandWindow.open();
    this._commandWindow.activate();
};

/**
 * ソートの実処理
 */
Scene_AbilityOrb.prototype.sortProcess = function(method, isDescend)
{
    $gameParty.abilityOrbs().sort(method, isDescend);
    this._itemWindow.deselect();
    this._itemWindow.refresh();
    this.onCommandCancel();
};

/**
 * ソート : 種類
 */
Scene_AbilityOrb.prototype.commandSortByCategory = function()
{
    this.sortProcess('category');
};

/**
 * ソート : 名前
 */
Scene_AbilityOrb.prototype.commandSortByName = function()
{
    this.sortProcess('name');
};

/**
 * ソート : レベル
 */
Scene_AbilityOrb.prototype.commandSortByLevel = function()
{
    this.sortProcess('levelDescend');
};

/**
 * ソート : AP
 */
Scene_AbilityOrb.prototype.commandSortByAp = function()
{
    this.sortProcess('apDescend');
};

/**
 * 全装備解除の実行
 */
Scene_AbilityOrb.prototype.commandClear = function()
{
    SoundManager.playEquipAbilityOrb();
    this.actor().releaseAllAbilityOrb();
    this._slotWindow.refresh();
    this._itemWindow.refresh();
    this._statusWindow.refresh();

    this.onCommandCancel();
};

/**
 * スロットの選択
 */
Scene_AbilityOrb.prototype.onSlotOk = function()
{
    this._itemWindow.activate();
    if (this._itemWindow.index() < 0)
    {
        this._itemWindow.select(0);
    }
};

/**
 * オーブの単一装備解除
 */
Scene_AbilityOrb.prototype.releaseOrb = function()
{
    SoundManager.playEquipAbilityOrb();
    this.actor().equipAbilityOrb(
        this._slotWindow.selectedEquipType(),
        this._slotWindow.selectedSlotIndex(),
        null,
        true);  // 外したオーブは適当な位置に戻す
    this._slotWindow.refresh();
    this._slotWindow.updateHelp();
    this._itemWindow.refresh();
    this._statusWindow.refresh();
};

/**
 * コマンドウィンドウのキャンセル
 */
Scene_AbilityOrb.prototype.onCommandCancel = function()
{
    this._slotWindow.activate();
    this._commandWindow.deactivate();
    this._commandWindow.close();
};

/**
 * リストからのオーブ選択
 */
Scene_AbilityOrb.prototype.onItemOk = function()
{
    SoundManager.playEquipAbilityOrb();
    var prevOrb = this.actor().equipAbilityOrb(
        this._slotWindow.selectedEquipType(),
        this._slotWindow.selectedSlotIndex(),
        this._itemWindow.item(),
        false);

    if (prevOrb != null)
    {
        // 外したオーブはリストの選択位置に戻す
        $gameParty.abilityOrbs().gain(prevOrb, this._itemWindow.index());
    }

    this._slotWindow.activate();
    this._slotWindow.refresh();
    this._slotWindow.updateHelp();
    this._itemWindow.refresh();
    this._statusWindow.refresh();
};

/**
 * オーブ選択のキャンセル
 */
Scene_AbilityOrb.prototype.onItemCancel = function()
{
    this._slotWindow.activate();
};

/**
 * アクター変更時の処理
 */
Scene_AbilityOrb.prototype.onActorChange = function()
{
    this.refreshActor();
    this._slotWindow.activate();
};


//-----------------------------------------------------------------------------
// Scene_Shop

var _KMS_Scene_Shop_prepare = Scene_Shop.prototype.prepare;
Scene_Shop.prototype.prepare = function(goods, purchaseOnly)
{
    _KMS_Scene_Shop_prepare.call(this, goods, purchaseOnly);

    // オーブを陳列する
    this._goods = this._goods.concat($gameTemp.shopAbilityOrbs);
    $gameTemp.clearShopAbilityOrbs();
};

// 購入実行
var _KMS_Scene_Shop_doBuy = Scene_Shop.prototype.doBuy;
Scene_Shop.prototype.doBuy = function(number)
{
    if (DataManager.isAbilityOrb(this._item))
    {
        $gameParty.loseGold(number * this.buyingPrice());
        for (var i = 0; i < number; i++)
        {
            $gameParty.gainAbilityOrbById(this._item.id, 1);
        }
    }
    else
    {
        _KMS_Scene_Shop_doBuy.call(this, number);
    }
};

// 売却実行
var _KMS_Scene_Shop_doSell = Scene_Shop.prototype.doSell;
Scene_Shop.prototype.doSell = function(number)
{
    if (DataManager.isAbilityOrb(this._item))
    {
        // オーブの売却は必ず 1 個ずつのはず
        $gameParty.gainGold(this.sellingPrice());
        $gameParty.loseAbilityOrb(this._item);
    }
    else
    {
        _KMS_Scene_Shop_doSell.call(this, number);
    }
};

})();

