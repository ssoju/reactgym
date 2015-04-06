'use strict';

jest.dontMock('../../scripts/utils/BackupUtil.js');
var BackupUtil = require('../../scripts/utils/BackupUtil.js');

LocalFileSystem = {
    PERSISTENT: null
};

FileReader = function() {
    this.readAsText = () => {
        this.onloadend({
            target: {
                result: "{\"some\": \"data\"}"
            }
        });
    };
};

window.requestFileSystem = (filesys, num, cb) => {
    let fs = {
        root: {
            getDirectory(folder, options, callback) {
                let dirEntry = {
                    getFile(name, opts, filecb) {
                        let file = {
                            createWriter(createwritercb) {
                                let writer = {
                                    write() {
                                        this.onwriteend();
                                    }
                                };
                                createwritercb(writer);
                            }
                        };
                        filecb(file);
                    },
                    createReader() {
                        return {
                            readEntries(entrycb) {
                                let entries = [
                                    {
                                        name: 'someFile'
                                    },
                                    {
                                        name: 'anotherFile'
                                    }
                                ];
                                entrycb(entries);
                            }
                        };
                    }
                };
                callback(dirEntry);
            }
        }
    };
    cb(fs);
};
window.alert = jest.genMockFunction();

describe("BackupUtil", () => {
    describe("getDirectory", () => {
        it("gets a directory and triggers the callback", () => {
            let cb = jest.genMockFunction();
            BackupUtil.getDirectory(cb, null);
            expect(cb.mock.calls.length).toBe(1);
        });
    });

    describe("err", () => {
        it("alerts [FAIL] with an error message", () => {
            BackupUtil.err('hello')();
            expect(window.alert.mock.calls.length).toBe(1);
        });
    });

    describe("getBackup", () => {
        it("gets a specified file from the directory", () => {
            let cb = jest.genMockFunction();
            BackupUtil.getBackup('someFile', cb);
            expect(cb.mock.calls.length).toBe(1);
            expect(cb.mock.calls[0][1].some).toBe("data");
        });
    });

    describe("getBackups", () => {
        it("gets filenaems of all the files in a directory", () => {
            let cb = jest.genMockFunction();
            BackupUtil.getBackups(cb);
            expect(cb.mock.calls.length).toBe(1);
            expect(cb.mock.calls[0][1].get(0).get('label')).toBe("someFile");
            expect(cb.mock.calls[0][1].get(1).get('label')).toBe("anotherFile");
        });
    });

    describe("saveBacku", () => {
        it("creates a new file and saves the backup", () => {
            let cb = jest.genMockFunction();
            BackupUtil.saveBackup({some: "data"}, cb);
            expect(cb.mock.calls.length).toBe(1);
            expect(cb.mock.calls[0][1].get(0).get('label')).toBe("someFile");
        });
    });
});

