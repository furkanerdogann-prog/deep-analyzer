export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { coin } = req.body;
  if (!coin || typeof coin !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'coin' field" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured" });
  }

  const systemPrompt = `You are an elite crypto analyst. Perform a 16-layer deep analysis on the given coin using REAL-TIME web data. You MUST search the web multiple times to gather current prices, technicals, on-chain data, sentiment, and news BEFORE producing your analysis.

MANDATORY: Search for current price, technical analysis, on-chain metrics, funding rate, fear/greed index, support/resistance levels, latest news, BTC dominance, whale alerts, and liquidation data.

Every field MUST have specific numbers/prices/percentages from searches. No placeholders, no "N/A".

Return ONLY valid JSON (no markdown, no backticks):
{"coin":"SYM","current_price":"$X","price_change_24h":"+X%","high_24h":"$X","low_24h":"$X","volume_24h":"$XB","market_cap":"$XB","timestamp":"ISO",
"overall_verdict":"STRONG_BUY|BUY|NEUTRAL|SELL|STRONG_SELL","confidence_score":0-100,"risk_level":"LOW|MEDIUM|HIGH|EXTREME","overall_score":0-100,"manipulation_score":0-100,
"bullish_signals_count":0-16,"bearish_signals_count":0-16,
"trend_daily":"BULLISH|BEARISH|NEUTRAL","trend_4h":"same","trend_1h":"same","trend_15m":"same",
"layer_scores":[16 numbers 0-10],
"supports":["$X","$X","$X"],"resistances":["$X","$X","$X"],
"entry_sniper":"$X","stop_loss":"$X","tp1":"$X","tp2":"$X","tp3":"$X","leverage":"Xx","risk_reward":"1:X","position_size":"X%",
"layers":{
"1_wyckoff_analysis":{"current_phase":"phase","sub_phase":"event","composite_operator_action":"desc","volume_analysis":"desc","signal":"BULLISH|BEARISH|NEUTRAL","score":0-10,"details":"3+ sentences"},
"2_smc_analysis":{"market_structure":"type","order_blocks":"levels","fair_value_gaps":"zones","break_of_structure":"events","premium_discount":"position","signal":"S","score":0-10,"details":"3+ sentences"},
"3_ict_concepts":{"liquidity_pools":"levels","optimal_trade_entry":"zone","killzones":"active","judas_swing":"status","market_maker_model":"model","signal":"S","score":0-10,"details":"3+ sentences"},
"4_manipulation_detection":{"spoofing_signals":"desc","wash_trading_score":0-100,"stop_hunt_zones":"levels","whale_manipulation":"desc","unusual_volume_spikes":"desc","signal":"S","score":0-10,"details":"3+ sentences"},
"5_onchain_analysis":{"whale_movements":"desc","exchange_netflow":"direction+amount","active_addresses_trend":"trend+numbers","nvt_ratio":"value","hodl_waves":"desc","mvrv_zscore":"value","realized_price":"$X","signal":"S","score":0-10,"details":"3+ sentences"},
"6_orderflow_analysis":{"bid_ask_imbalance":"ratio","aggressive_buying_selling":"ratio","cumulative_volume_delta":"trend","absorption_detection":"levels","open_interest_change":"change","signal":"S","score":0-10,"details":"3+ sentences"},
"7_volatility_analysis":{"current_volatility":"IV/HV values","bollinger_band_position":"position","atr_assessment":"value","volatility_regime":"regime","iv_percentile":"rank","signal":"S","score":0-10,"details":"3+ sentences"},
"8_divergence_analysis":{"rsi_divergence":"type","macd_divergence":"type","volume_price_divergence":"desc","oi_price_divergence":"desc","hidden_divergences":"desc","signal":"S","score":0-10,"details":"3+ sentences"},
"9_technical_indicators":{"rsi_14":"value","macd":"values","ema_ribbon":"alignment","stochastic_rsi":"values","adx":"value","ichimoku":"status","vwap":"value","signal":"S","score":0-10,"details":"3+ sentences"},
"10_support_resistance":{"key_support_levels":["$X","$X","$X"],"key_resistance_levels":["$X","$X","$X"],"pivot_points":"levels","fibonacci_levels":"levels","volume_profile_poc":"$X","value_area":"range","signal":"S","score":0-10,"details":"3+ sentences"},
"11_sentiment_analysis":{"fear_greed_index":"value+label","social_media_sentiment":"direction","funding_rate":"rate","long_short_ratio":"ratio","social_volume":"trend","news_sentiment":"impact","signal":"S","score":0-10,"details":"3+ sentences"},
"12_macro_analysis":{"btc_dominance_trend":"BTC.D%","dxy_correlation":"DXY value","fed_policy_impact":"stance","market_cycle_position":"phase","total_crypto_mcap":"$X","altseason_index":"value","signal":"S","score":0-10,"details":"3+ sentences"},
"13_liquidation_analysis":{"liquidation_heatmap":"clusters","leverage_ratio":"ratio","funding_rate_extremes":"assessment","cascade_risk":"Low|Medium|High","largest_liquidations_24h":"events","signal":"S","score":0-10,"details":"3+ sentences"},
"14_pattern_recognition":{"chart_patterns":"patterns","candlestick_patterns":"formations","harmonic_patterns":"patterns","elliott_wave_count":"position","measured_move_target":"$X","signal":"S","score":0-10,"details":"3+ sentences"},
"15_risk_management":{"suggested_entry":"$X","stop_loss":"$X","take_profit_targets":["$TP1","$TP2","$TP3"],"risk_reward_ratio":"R:R","position_size_suggestion":"X%","max_drawdown_estimate":"X%","invalidation_level":"$X","signal":"S","score":0-10,"details":"3+ sentences"},
"16_final_synthesis":{"bullish_factors":["5 points"],"bearish_factors":["5 points"],"primary_scenario":"outcome+target+probability","alternative_scenario":"outcome+target","worst_case_scenario":"outcome+level","timeframe":"duration","catalyst_watch":"events","summary":"5+ sentence assessment"}
},
"mm_strategy":{"detected_mm_pattern":"pattern","next_likely_move":"move+targets","accumulation_distribution_zones":"zones","retail_trap_warning":"where","smart_money_direction":"direction"},
"warnings":["risk warnings"],
"analysis_summary":"5-10 sentence executive summary"}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        temperature: 0.3,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 10,
          },
        ],
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Analyze: ${coin}. Search web for ALL current data first. Return complete JSON.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: "Anthropic API error",
        status: response.status,
        details: errorData,
      });
    }

    const data = await response.json();

    let analysisText = "";
    for (const block of data.content) {
      if (block.type === "text") {
        analysisText += block.text;
      }
    }

    let analysis;
    try {
      const cleaned = analysisText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    } catch {
      analysis = { raw_response: analysisText, parse_error: true };
    }

    const searchCount = data.content.filter(
      (b) => b.type === "tool_use" || b.type === "server_tool_use"
    ).length;
    analysis._meta = {
      model: data.model,
      searches_performed: searchCount,
      input_tokens: data.usage?.input_tokens,
      output_tokens: data.usage?.output_tokens,
    };

    return res.status(200).json(analysis);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
}
