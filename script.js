// ==UserScript==
// @name Jira Trans Time Estimate Summary
// @namespace team-bio
// @version 0.1
// @description  This adds a summary divided by the development/test estimaion on the bottom
// @match https://jira.trans.eu/*
// @copyright 2025 Bio Team
// ==/UserScript==

(function() {
    'use strict';

    function calculateWorkload() {
    document.querySelectorAll('.custom-jira-summary').forEach(el => el.remove());

    const sprintContainers = document.querySelectorAll(
        '.ghx-backlog-container.ghx-sprint-planned, .ghx-backlog-container.ghx-sprint-active'
    );

    if (sprintContainers.length === 0) {
        console.warn("Nie udało się znaleźć żadnych sprintów (planowanych ani aktywnych).");
        return;
    }

    sprintContainers.forEach(scopeElement => {
        const items = scopeElement.querySelectorAll('.ghx-issue-content');

        let totalDev = 0;
        let totalTest = 0;

        items.forEach(item => {
            const fields = item.querySelectorAll('.ghx-plan-extra-fields .ghx-extra-field .ghx-extra-field-content');
            if (fields.length >= 3) {
                const sumMatch = fields[1].innerText.trim().match(/(\d+)\s*h?/);
                const testMatch = fields[2].innerText.trim().match(/(\d+)/);
                if (sumMatch && testMatch) {
                    const sum = parseInt(sumMatch[1], 10);
                    const tester = parseInt(testMatch[1], 10);
                    const dev = sum - tester;
                    if (!isNaN(dev) && !isNaN(tester)) {
                        totalDev += dev;
                        totalTest += tester;
                    }
                }
            }
        });

        let statBox = scopeElement.querySelector('.ghx-stat-total');

        if (!statBox) {
            const issuesList = scopeElement.querySelector('.ghx-issues');
            if (!issuesList) {
                console.warn("Nie znaleziono .ghx-stat-total ani .ghx-issues.");
                return;
            }

            statBox = document.createElement('div');
            statBox.className = 'ghx-stat-total custom-jira-summary';

            // Stylowanie o które prosiłeś
            statBox.style.textAlign = 'right';
            statBox.style.padding = '20px';
            statBox.style.boxSizing = 'border-box';

            issuesList.insertAdjacentElement('afterend', statBox);
        }

        statBox.insertAdjacentHTML('beforeend', `
            <span class="custom-jira-summary">
                <span class="ghx-label">DEV</span>
                <aui-badge title="${totalDev}h Developer Time Estimate">${totalDev}h</aui-badge>
                <span class="ghx-label">QA</span>
                <aui-badge title="${totalTest}h Tester Time Estimate">${totalTest}h</aui-badge>
            </span>
        `);
    });
}

function waitForTasks(callback) {
    const check = setInterval(() => {
        if (document.querySelectorAll('.ghx-issue-content').length > 0) {
            clearInterval(check);
            callback();
        }
    }, 300);
}

waitForTasks(() => calculateWorkload());
})();


