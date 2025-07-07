import ApiService from "@service/ApiService";

const get = async (infoSearch) => {
    const valueUserInfo = localStorage.getItem(infoSearch)
    if (valueUserInfo) {
        return valueUserInfo
    }

    const valueUserInfoApi = (await ApiService.getUserInfo()).data[infoSearch]
    if (valueUserInfoApi) {
        localStorage.setItem(infoSearch, valueUserInfoApi)
        return valueUserInfoApi;
    }
};

const set = async (infoSearch, value) => {
    localStorage.setItem(infoSearch, value)
    const payload = {}
    payload[infoSearch] = value;
    ApiService.updateUserInfo(payload);
};

const UserInfo = {
    get: (infoSearch) => get(infoSearch),
    set: (infoSearch, value) => set(infoSearch, value),
};

export default UserInfo;
