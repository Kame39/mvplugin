//=============================================================================
// KMS_RouletteDamageDigits.js
//   Last update: 2015/11/30
//=============================================================================

/*:
 * @plugindesc
 * [v0.1.0] Shuffle damage digits.
 * 
 * @author TOMY (Kamesoft)
 *
 * @param Interval
 * @default 4
 * @desc Interval frames for updating digits.
 *
 * @param Duration
 * @default 40
 * @desc Duration for shuffling digits. [frame]
 *
 * @param Always shuffle pattern
 * @default 0
 * @desc
 * Always shuffle a roulette pattern of digits.
 * 0: Not shuffled  1: Always shuffled
 *
 * @help This plugin does not provide plugin commands.
 */

/*:ja
 * @plugindesc
 * [v0.1.0] ダメージ数値をシャッフルしながら表示します。
 * 
 * @author TOMY (Kamesoft)
 *
 * @param Interval
 * @default 4
 * @desc 数値を更新する間隔をフレーム単位で指定します。
 *
 * @param Duration
 * @default 40
 * @desc ルーレット表示する時間をフレーム単位で指定します。
 *
 * @param Always shuffle pattern
 * @default 0
 * @desc
 * 数値ルーレットの表示パターンを指定します。
 * 0: 毎回同じ  1: 毎回シャッフル
 *
 * @help このプラグインには、プラグインコマンドはありません。
 */

(function() {

var parameters = PluginManager.parameters('KMS_RouletteDamageDigits');
var Params = {};
Params.updateInterval = Number(parameters['Interval'] || 4);
Params.duration = Number(parameters['Duration'] || 40);
Params.alwaysShuffle = Number(parameters['Always shuffle pattern'] || 0);

// ルーレットの初期値
var InitialRouletteDigit = [5, 8, 3, 1, 9, 4, 2, 7, 0, 6];

/*
 * 配列をシャッフルし、新たな配列として返す
 * 
 * @param {Array} target array
 * @returns {Array}
 */
var shuffle = function(array)
{
    var count = array.length;
    var newArray = [];

    // 複製
    for (var i = 0; i < count; i++)
    {
        newArray[i] = array[i];
    }

    // Fisher-Yates shuffle
    while (count)
    {
        var i = Math.randomInt(count--);
        var tempVal = newArray[count];
        newArray[count] = newArray[i];
        newArray[i] = tempVal;
    }

    return newArray;
};

//-----------------------------------------------------------------------------
// Sprite_Damage

var _KMS_RouletteDamageDigits_Sprite_Damage_createDigits = Sprite_Damage.prototype.createDigits;
Sprite_Damage.prototype.createDigits = function(baseRow, value)
{
    _KMS_RouletteDamageDigits_Sprite_Damage_createDigits.call(this, baseRow, value);
    this.applyRouletteDigit(value);
};

/*
 * 各桁にカシャカシャを適用
 */
Sprite_Damage.prototype.applyRouletteDigit = function(value)
{
    var string = Math.abs(value).toString();
    for (var i = 0; i < this.children.length; i++)
    {
        if (!(this.children[i] instanceof Sprite))
        {
            continue;
        }

        var sprite = this.children[i];
        sprite._actualNumber = Number(string[i]);
        sprite._rouletteIndex = Math.randomInt(InitialRouletteDigit.length);
        sprite._rouletteOffset = i;
        sprite._roulette = Params.alwaysShuffle ?
            shuffle(InitialRouletteDigit) :
            InitialRouletteDigit;
    }
};

var _KMS_RouletteDamageDigits_Sprite_Damage_updateChild = Sprite_Damage.prototype.updateChild;
Sprite_Damage.prototype.updateChild = function(sprite)
{
    this.updateRouletteDigit(sprite);
    _KMS_RouletteDamageDigits_Sprite_Damage_updateChild.call(this, sprite);
};

/*
 * 数値のカシャカシャ更新
 */
Sprite_Damage.prototype.updateRouletteDigit = function(sprite)
{
    if (sprite._actualNumber == null || sprite._rouletteIndex < 0)
    {
        return;
    }

    var endDuration = Math.max(90 - Params.duration, 0);
    if (this._duration + sprite._rouletteOffset > endDuration)
    {
        if ((this._duration % Params.updateInterval) == 0)
        {
            sprite._frame.x = sprite._roulette[sprite._rouletteIndex] * sprite._frame.width;
            sprite._rouletteIndex = (sprite._rouletteIndex + 1) % sprite._roulette.length;
            sprite._refresh();
        }
    }
    else
    {
        sprite._frame.x = sprite._actualNumber * sprite._frame.width;
        sprite._rouletteIndex = -1;
        sprite._refresh();
    }
};

})();
