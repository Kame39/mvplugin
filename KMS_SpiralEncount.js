//=============================================================================
// KMS_SpiralEncount.js
//=============================================================================

/*
 * This plugin can be used in the environment which supports WebGL.
 */

/*:
 * @plugindesc
 * [v0.2] Applies spiral encounter effect.
 * 
 * @author TOMY (Kamesoft)
 *
 * @param Speed
 * @default 0.2
 * @desc Effect speed.
 *
 * @param Radius
 * @default 1.5
 * @desc Effect range. 1.0 is same as screen size.
 *
 * @param Show characters
 * @default 0
 * @desc
 * Show characters or not.
 * 0: hide, 1: show
 *
 * @help This plugin does not provide plugin commands.
 */

/*:ja
 * @plugindesc
 * [v0.2] エンカウント時に画面を回転させるエフェクトを適用します。
 * 
 * @author TOMY (Kamesoft)
 *
 * @param Speed
 * @default 0.2
 * @desc 回転の速度です。
 *
 * @param Radius
 * @default 1.5
 * @desc エフェクトの適用半径です。1.0 で画面サイズ相当です。
 *
 * @param Show characters
 * @default 0
 * @desc
 * エフェクト時にキャラクターを表示するか指定します。
 * 0: 非表示, 1: 表示
 *
 * @help このプラグインには、プラグインコマンドはありません。
 */

(function()
{

if (!Graphics.hasWebGL())
{
    console.error("WebGL をサポートしていないため、フィルターを使用できません。");
    return;
}

var pluginParams = PluginManager.parameters('KMS_SpiralEncount');
var Params = {};
Params.angleSpeed = Number(pluginParams['Speed']  || 0.2);
Params.radius     = Number(pluginParams['Radius'] || 1.5);
Params.showCharacters = Boolean(Number(pluginParams['Show characters'] || 0));

if (Params.showCharacters)
{
    Scene_Map.prototype.startEncounterEffect = function()
    {
        this._encounterEffectDuration = this.encounterEffectSpeed();
    };
}

/*
 * 回転エンカウントエフェクトの適用
 */
Scene_Map.prototype.applySpiralEncounterEffect = function()
{
    this._encounterFilter = new PIXI.TwistFilter();
    this._encounterFilter.angle  = 0;
    this._encounterFilter.radius = Params.radius;

    if (this._spriteset.filters instanceof Array)
    {
        // filters に再代入しないとフィルターが変更されない
        var newFilters = this._spriteset.filters;
        newFilters.push(this._encounterFilter);
        this._spriteset.filters = newFilters;
    }
    else
    {
        this._spriteset.filters = [this._encounterFilter];
    }

    var margin = 48;
    var width  = Graphics.width;
    var height = Graphics.height;
    this._spriteset.filterArea = new Rectangle(-margin, -margin, width, height);
};

var _KMS_SpiralEncount_Scene_Map_updateEncounterEffect = Scene_Map.prototype.updateEncounterEffect;
Scene_Map.prototype.updateEncounterEffect = function()
{
    var needEffectUpdate = this._encounterEffectDuration > 0;

    _KMS_SpiralEncount_Scene_Map_updateEncounterEffect.call(this);

    if (needEffectUpdate)
    {
        var speed = this.encounterEffectSpeed();
        var n = speed - this._encounterEffectDuration;
        if (n === 2 && Graphics.isWebGL())
        {
            this.applySpiralEncounterEffect();
        }

        if (this._encounterFilter)
        {
            this._encounterFilter.angle += Params.angleSpeed;
        }
    }
};

})();
