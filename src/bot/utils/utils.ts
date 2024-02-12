export const isCancel = (messsage: string) => {
    if (messsage === '/cancel') {
        return true;
    }
    return false;
};
