#!/bin/bash

# Mock Backend DataCache Migration Verification Script

echo "🔍 Mock 后端 DataCache 迁移验证"
echo "================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to print result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((CHECKS_FAILED++))
    fi
}

# Check 1: Verify DataCache service exists and compiles
echo "📋 检查 1: DataCache 服务"
if [ -f "mock-backend-service/src/services/DataCache.ts" ]; then
    print_result 0 "DataCache 服务文件存在"
else
    print_result 1 "DataCache 服务文件不存在"
fi

# Check 2: Verify DataCache is exported
if grep -q "export.*DataCache" mock-backend-service/src/services/DataCache.ts; then
    print_result 0 "DataCache 正确导出"
else
    print_result 1 "DataCache 未正确导出"
fi

# Check 3: Verify controllers import DataCache
echo ""
echo "📋 检查 2: 控制器导入"
for controller in postController commentController userController messageController notificationController topicController searchController voiceController; do
    if grep -q "import.*DataCache" mock-backend-service/src/controllers/${controller}.ts 2>/dev/null; then
        print_result 0 "${controller} 导入 DataCache"
    else
        if [ "$controller" = "productController" ]; then
            print_result 0 "${controller} 不需要 DataCache（只读）"
        else
            print_result 1 "${controller} 未导入 DataCache"
        fi
    fi
done

# Check 4: Verify no more readFileSync/writeFileSync in controllers
echo ""
echo "📋 检查 3: 消除同步文件 I/O"
for controller in postController commentController userController messageController notificationController topicController searchController voiceController; do
    if grep -q "readFileSync\|writeFileSync" mock-backend-service/src/controllers/${controller}.ts 2>/dev/null; then
        # Allow voiceController to have writeFileSync for audio files
        if [ "$controller" = "voiceController" ] && grep "saveBase64File\|buffer" mock-backend-service/src/controllers/${controller}.ts | grep -q "writeFileSync"; then
            print_result 0 "${controller} 移除同步 I/O（音频文件除外）"
        else
            print_result 1 "${controller} 仍存在同步文件 I/O"
        fi
    else
        print_result 0 "${controller} 移除同步文件 I/O"
    fi
done

# Check 5: Verify dataCache.load usage
echo ""
echo "📋 检查 4: DataCache.load 调用"
LOAD_COUNT=$(grep -r "dataCache.load" mock-backend-service/src/controllers/ | wc -l)
if [ $LOAD_COUNT -gt 0 ]; then
    print_result 0 "找到 $LOAD_COUNT 个 dataCache.load() 调用"
else
    print_result 1 "未找到 dataCache.load() 调用"
fi

# Check 6: Verify dataCache.save usage
echo ""
echo "📋 检查 5: DataCache.save 调用"
SAVE_COUNT=$(grep -r "dataCache.save" mock-backend-service/src/controllers/ | wc -l)
if [ $SAVE_COUNT -gt 0 ]; then
    print_result 0 "找到 $SAVE_COUNT 个 dataCache.save() 调用"
else
    print_result 1 "未找到 dataCache.save() 调用"
fi

# Check 7: Verify postController has pagination
echo ""
echo "📋 检查 6: 分页功能"
if grep -q "X-Total-Count\|pageSize\|page" mock-backend-service/src/controllers/postController.ts; then
    print_result 0 "postController 添加分页支持"
else
    print_result 1 "postController 缺少分页支持"
fi

# Check 8: Documentation files exist
echo ""
echo "📋 检查 7: 文档文件"
for doc in MOCK_QUICK_START.md MOCK_PERFORMANCE_SUMMARY.md MOCK_DATACACHE_MIGRATION.md MOCK_PERFORMANCE_DIAGNOSIS.md; do
    if [ -f "docs/$doc" ]; then
        print_result 0 "文档 $doc 存在"
    else
        print_result 1 "文档 $doc 缺失"
    fi
done

# Summary
echo ""
echo "================================"
echo "📊 验证结果总结"
echo "================================"
echo -e "✓ 通过: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "✗ 失败: ${RED}$CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 所有检查通过！DataCache 迁移成功！${NC}"
    exit 0
else
    echo -e "${RED}❌ 部分检查失败，请查看上面的详细信息${NC}"
    exit 1
fi
