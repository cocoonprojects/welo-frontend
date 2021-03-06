describe('VoteExtractor', function(){
    var voteExtractor;
    var userId = "123test";

    beforeEach(function(){
        var $injector = angular.injector(['app.collaboration']);
        voteExtractor = $injector.get('voteExtractor');
    });

    it('should return: "You rejected this idea" if status is 0 and user approval 0', function(){
        var mockElm = {
            status:0,
            approvals:{
                "123test": {
                    approval: 0
                }
            }
        };

        expect(voteExtractor(userId, mockElm)).toBe("You rejected this idea");
    });

    it('should return: "You have already accepted this idea" if status is 0 and user approval 1', function(){
        var mockElm = {
            status:0,
            approvals:{
                "123test": {
                    approval: 1
                }
            }
        };

        expect(voteExtractor(userId, mockElm)).toBe("You have already accepted this idea");
    });

    it('should return: "You have absteined from vote this idea" if status is 0 and user approval 2', function(){
        var mockElm = {
            status:0,
            approvals:{
                "123test": {
                    approval: 2
                }
            }
        };

        expect(voteExtractor(userId, mockElm)).toBe("You have absteined from voting this idea");
    });

    it('should return: "You haven\'t accepted" is status is 40 and user acceptance 0', function(){
        var mockElm = {
            status:40,
            acceptances:{
                "123test": {
                    acceptance: 0
                }
            }
        };

        expect(voteExtractor(userId, mockElm)).toBe("You haven't accepted");
    });

    it('should return: "You have accepted" is status is 40 and user acceptance 1', function(){
        var mockElm = {
            status:40,
            acceptances:{
                "123test": {
                    acceptance: 1
                }
            }
        };

        expect(voteExtractor(userId, mockElm)).toBe("You have accepted");
    });

    it('should return: "You have accepted" is status is 40 and user acceptance 1', function(){
        var mockElm = {
            status:40,
            acceptances:{
                "123test": {
                    acceptance: 1
                }
            }
        };

        expect(voteExtractor(userId, mockElm)).toBe("You have accepted");
    });

    it('should return: "You have absteined from accepting this work item" is status is 40 and user acceptance 2', function(){
        var mockElm = {
            status:40,
            acceptances:{
                "123test": {
                    acceptance: 2
                }
            }
        };

        expect(voteExtractor(userId, mockElm)).toBe("You have absteined from accepting this work item");
    });

});