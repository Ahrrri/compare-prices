// 외부 설정 파일 로더

/**
 * 외부 JSON 설정 파일을 로드합니다.
 * @param {string} configPath - 설정 파일 경로 (기본값: '/config.json')
 * @returns {Promise<object>} 설정 객체
 */
export async function loadExternalConfig(configPath = '/config.json') {
  try {
    const response = await fetch(configPath);
    if (!response.ok) {
      throw new Error(`설정 파일을 불러올 수 없습니다: ${response.status}`);
    }
    
    const config = await response.json();
    console.log('외부 설정 파일 로드 성공:', config.description || 'Unknown config');
    
    return config.settings || config;
  } catch (error) {
    console.warn('외부 설정 파일 로드 실패, 기본값 사용:', error.message);
    return null;
  }
}

/**
 * localStorage에서 사용자 설정을 로드합니다.
 * @param {string} key - localStorage 키 (기본값: 'mapleCurrencySettings')
 * @returns {object|null} 저장된 설정 객체 또는 null
 */
export function loadUserSettings(key = 'mapleCurrencySettings') {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const settings = JSON.parse(saved);
      console.log('사용자 설정 로드 성공');
      return settings;
    }
  } catch (error) {
    console.warn('사용자 설정 로드 실패:', error.message);
  }
  return null;
}

/**
 * localStorage에 사용자 설정을 저장합니다.
 * @param {object} settings - 저장할 설정 객체
 * @param {string} key - localStorage 키 (기본값: 'mapleCurrencySettings')
 * @returns {boolean} 저장 성공 여부
 */
export function saveUserSettings(settings, key = 'mapleCurrencySettings') {
  try {
    const settingsWithTimestamp = {
      ...settings,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(settingsWithTimestamp));
    console.log('사용자 설정 저장 성공');
    return true;
  } catch (error) {
    console.error('사용자 설정 저장 실패:', error.message);
    return false;
  }
}

/**
 * 설정을 JSON 파일로 다운로드합니다.
 * @param {object} settings - 다운로드할 설정 객체
 * @param {string} filename - 파일명 (기본값: 'maple-currency-settings.json')
 */
export function downloadSettingsAsFile(settings, filename = 'maple-currency-settings.json') {
  try {
    const configData = {
      description: "메이플스토리 화폐 변환 계산기 설정 파일",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      settings: settings
    };
    
    const dataStr = JSON.stringify(configData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('설정 파일 다운로드 완료:', filename);
  } catch (error) {
    console.error('설정 파일 다운로드 실패:', error.message);
  }
}

/**
 * 파일 입력을 통해 설정을 가져옵니다.
 * @returns {Promise<object|null>} 로드된 설정 객체 또는 null
 */
export function importSettingsFromFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) {
        resolve(null);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result);
          console.log('설정 파일 가져오기 성공:', config.description || 'Unknown config');
          resolve(config.settings || config);
        } catch (error) {
          console.error('설정 파일 파싱 실패:', error.message);
          resolve(null);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  });
}