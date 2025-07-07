import ApiService from "@service/api/ApiService";

const getAvatar = async () => {
    const avatar = localStorage.getItem('avatar')
    if (avatar) {
        return avatar
    }
    const user = (await ApiService.getUser())
    if (user) {
        localStorage.setItem('avatar', user.data.image)
        return user.data.image;
    }
    return false
}

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
    getAvatar: () => getAvatar()
};

export default UserInfo;
