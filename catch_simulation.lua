-- ===================================================================
-- catch_simulation.lua
-- ตัวอย่างระบบจำลองการสุ่มความน่าจะเป็น (RNG Simulation) สำหรับการพัฒนาเกม
-- แสดงโครงสร้างการคำนวณอัตราความสำเร็จ (Catch Rate) และ Super Lucky
-- ===================================================================

local CatchSystem = {}

-- กำหนดค่าอัตราสุ่มพื้นฐาน (เปอร์เซ็นต์ %)
local CONFIG = {
    BASE_SUPER_LUCKY_RATE = 5.0,  -- โอกาสติด Super Lucky 5%
    BASE_CATCH_RATE       = 35.0, -- โอกาสจับสำเร็จปกติ 35%
}

--- ฟังก์ชันคำนวณการจับมอนสเตอร์
--- @param bonusLuck number เปอร์เซ็นต์โบนัสความโชคดีเพิ่มเติม (เช่น บัฟอาหาร หรือไอเทม)
--- @param ballMultiplier number ตัวคูณประสิทธิภาพของบอล (เช่น บอลระดับสูง = 1.5)
--- @return table ผลลัพธ์การสุ่ม { success = bool, isSuperLucky = bool, rollValue = number }
function CatchSystem.simulateCatch(bonusLuck, ballMultiplier)
    bonusLuck = bonusLuck or 0.0
    ballMultiplier = ballMultiplier or 1.0

    -- คำนวณอัตราจริงหลังคิดโบนัส
    local finalSuperLuckyChance = CONFIG.BASE_SUPER_LUCKY_RATE + bonusLuck
    local finalCatchChance = (CONFIG.BASE_CATCH_RATE * ballMultiplier) + finalSuperLuckyChance

    -- สุ่มตัวเลขทศนิยม 1 ตำแหน่ง ระหว่าง 0.1 ถึง 100.0
    local roll = math.random(1, 1000) / 10.0

    local result = {
        success = false,
        isSuperLucky = false,
        rollValue = roll,
        superLuckyThreshold = finalSuperLuckyChance,
        catchThreshold = finalCatchChance
    }

    if roll <= finalSuperLuckyChance then
        -- ติด Super Lucky (สำเร็จแน่นอน พร้อมโบนัสพิเศษ)
        result.success = true
        result.isSuperLucky = true
    elseif roll <= finalCatchChance then
        -- จับสำเร็จปกติ
        result.success = true
        result.isSuperLucky = false
    else
        -- จับล้มเหลว
        result.success = false
        result.isSuperLucky = false
    end

    return result
end

-- ==========================================
-- ส่วนทดสอบการทำงานและเก็บสถิติ (Monte Carlo Test)
-- ==========================================
local function runSimulation(totalAttempts, bonusLuck, ballMultiplier)
    -- กำหนด Seed สุ่มตามเวลาปัจจุบัน
    math.randomseed(os.time())

    print("==================================================")
    print(string.format("เริ่มการจำลองจับทั้งหมด: %d ครั้ง", totalAttempts))
    print(string.format("โบนัสความโชคดี: +%.1f%% | ตัวคูณบอล: %.2fx", bonusLuck, ballMultiplier))
    print("==================================================")

    local successCount = 0
    local superLuckyCount = 0

    for i = 1, totalAttempts do
        local outcome = CatchSystem.simulateCatch(bonusLuck, ballMultiplier)
        if outcome.success then
            successCount = successCount + 1
        end
        if outcome.isSuperLucky then
            superLuckyCount = superLuckyCount + 1
        end
    end

    local successRate = (successCount / totalAttempts) * 100.0
    local superLuckyRate = (superLuckyCount / totalAttempts) * 100.0

    print(string.format("ผลรวมจับสำเร็จ: %d ครั้ง (%.2f%%)", successCount, successRate))
    print(string.format("ผลรวมติด Super Lucky: %d ครั้ง (%.2f%%)", superLuckyCount, superLuckyRate))
    print("==================================================")
end

-- สั่งรันการจำลอง 1,000 ครั้ง
runSimulation(1000, 2.5, 1.2)
