import { useState } from 'react';
import { DEFAULT_SETTINGS, mergeSettings, validateSettings } from '../config/defaultSettings';

export const useCurrencySettings = (userSettings = {}) => {
  // 기본 설정과 사용자 설정을 병합
  const initialSettings = mergeSettings(userSettings);
  
  // 설정 검증
  const validationErrors = validateSettings(initialSettings);
  if (validationErrors.length > 0) {
    console.warn('설정 검증 오류:', validationErrors);
    // 오류가 있으면 기본 설정을 사용
    Object.assign(initialSettings, DEFAULT_SETTINGS);
  }

  // 각 설정값을 state로 관리
  const [mesoMarketRates, setMesoMarketRates] = useState(initialSettings.mesoMarketRates);
  const [cashTradeRates, setCashTradeRates] = useState(initialSettings.cashTradeRates);
  const [solTradeRates, setSolTradeRates] = useState(initialSettings.solTradeRates);
  const [cashItemRates, setCashItemRates] = useState(initialSettings.cashItemRates);
  const [mvpGrade, setMvpGrade] = useState(initialSettings.mvpGrade);
  const [voucherDiscounts, setVoucherDiscounts] = useState(initialSettings.voucherDiscounts);
  const [exchangeOptions, setExchangeOptions] = useState(initialSettings.exchangeOptions);
  const [availableMileage, setAvailableMileage] = useState(initialSettings.availableMileage);
  const [mileageRates, setMileageRates] = useState(initialSettings.mileageRates);

  // 설정 초기화 함수
  const resetToDefaults = () => {
    setMesoMarketRates(DEFAULT_SETTINGS.mesoMarketRates);
    setCashTradeRates(DEFAULT_SETTINGS.cashTradeRates);
    setSolTradeRates(DEFAULT_SETTINGS.solTradeRates);
    setCashItemRates(DEFAULT_SETTINGS.cashItemRates);
    setMvpGrade(DEFAULT_SETTINGS.mvpGrade);
    setVoucherDiscounts(DEFAULT_SETTINGS.voucherDiscounts);
    setExchangeOptions(DEFAULT_SETTINGS.exchangeOptions);
    setAvailableMileage(DEFAULT_SETTINGS.availableMileage);
    setMileageRates(DEFAULT_SETTINGS.mileageRates);
  };

  // 현재 설정을 객체로 반환
  const getCurrentSettings = () => ({
    mesoMarketRates,
    cashTradeRates,
    solTradeRates,
    cashItemRates,
    mvpGrade,
    voucherDiscounts,
    exchangeOptions,
    availableMileage,
    mileageRates
  });

  return {
    // States
    mesoMarketRates,
    cashTradeRates,
    solTradeRates,
    cashItemRates,
    mvpGrade,
    voucherDiscounts,
    exchangeOptions,
    availableMileage,
    mileageRates,
    
    // Setters
    setMesoMarketRates,
    setCashTradeRates,
    setSolTradeRates,
    setCashItemRates,
    setMvpGrade,
    setVoucherDiscounts,
    setExchangeOptions,
    setAvailableMileage,
    setMileageRates,
    
    // Utility functions
    resetToDefaults,
    getCurrentSettings
  };
};