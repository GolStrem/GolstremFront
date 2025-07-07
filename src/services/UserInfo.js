import ApiService from "@service/api/ApiService";

const getId = async () => {
    const id = localStorage.getItem('id')
    if (id) {
        return id
    }
    const user = (await ApiService.getUser())
    if (user) {
        localStorage.setItem('id', user.data.id)
        return user.data.id;
    }
    return false
}

const getPseudo = async () => {
    const pseudo = localStorage.getItem('pseudo')
    if (pseudo) {
        return pseudo
    }
    const user = (await ApiService.getUser())
    if (user) {
        localStorage.setItem('pseudo', user.data.pseudo)
        return user.data.pseudo;
    }
    return false
}

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
    getAvatar: () => getAvatar(),
    getPseudo: () => getPseudo(),
    getId: () => getId()
};

export default UserInfo;
