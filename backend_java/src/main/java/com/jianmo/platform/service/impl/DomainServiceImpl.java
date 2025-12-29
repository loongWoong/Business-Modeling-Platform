package com.jianmo.platform.service.impl;

import com.jianmo.platform.dto.request.DomainCreateDTO;
import com.jianmo.platform.dto.request.DomainUpdateDTO;
import com.jianmo.platform.dto.response.DomainVO;
import com.jianmo.platform.entity.Domain;
import com.jianmo.platform.common.exception.BusinessException;
import com.jianmo.platform.repository.DomainRepository;
import com.jianmo.platform.service.DomainService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DomainServiceImpl implements DomainService {

    private final DomainRepository domainRepository;

    public DomainServiceImpl(DomainRepository domainRepository) {
        this.domainRepository = domainRepository;
    }

    @Override
    public List<DomainVO> getAllDomains() {
        return domainRepository.findAll().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    public DomainVO getDomainById(Long id) {
        return domainRepository.findById(id)
                .map(this::convertToVO)
                .orElseThrow(() -> new BusinessException("领域不存在: " + id));
    }

    @Override
    @Transactional
    public DomainVO createDomain(DomainCreateDTO dto) {
        if (domainRepository.existsByCode(dto.getCode())) {
            throw new BusinessException("领域编码已存在: " + dto.getCode());
        }
        if (domainRepository.existsByName(dto.getName())) {
            throw new BusinessException("领域名称已存在: " + dto.getName());
        }

        Domain domain = new Domain();
        domain.setCode(dto.getCode());
        domain.setName(dto.getName());
        domain.setDescription(dto.getDescription());
        domain.setOwner(dto.getOwner());
        domain.setDomainType(dto.getDomainType() != null ? dto.getDomainType() : "category");
        domain.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        domain.setModelQuota(dto.getModelQuota());
        domain.setPermissions(dto.getPermissions());
        domain.setWorkspaceConfig(dto.getWorkspaceConfig());
        domain.setCreatedAt(LocalDateTime.now());
        domain.setUpdatedAt(LocalDateTime.now());

        domainRepository.save(domain);

        return convertToVO(domain);
    }

    @Override
    @Transactional
    public DomainVO updateDomain(Long id, DomainUpdateDTO dto) {
        Domain domain = domainRepository.findById(id)
                .orElseThrow(() -> new BusinessException("领域不存在: " + id));

        if (dto.getCode() != null && !dto.getCode().equals(domain.getCode())) {
            if (domainRepository.existsByCode(dto.getCode())) {
                throw new BusinessException("领域编码已存在: " + dto.getCode());
            }
            domain.setCode(dto.getCode());
        }
        if (dto.getName() != null && !dto.getName().equals(domain.getName())) {
            if (domainRepository.existsByName(dto.getName())) {
                throw new BusinessException("领域名称已存在: " + dto.getName());
            }
            domain.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            domain.setDescription(dto.getDescription());
        }
        if (dto.getOwner() != null) {
            domain.setOwner(dto.getOwner());
        }
        domain.setUpdatedAt(LocalDateTime.now());

        domainRepository.save(domain);

        return convertToVO(domain);
    }

    @Override
    @Transactional
    public boolean deleteDomain(Long id) {
        if (!domainRepository.existsById(id)) {
            return false;
        }
        domainRepository.deleteById(id);
        return true;
    }

    private DomainVO convertToVO(Domain domain) {
        DomainVO vo = new DomainVO();
        vo.setId(domain.getId());
        vo.setCode(domain.getCode());
        // 修复可能存在的乱码数据（GBK字节被错误解释为UTF-8）
        vo.setName(com.jianmo.platform.utils.EncodingFixer.smartFix(domain.getName()));
        vo.setDescription(com.jianmo.platform.utils.EncodingFixer.smartFix(domain.getDescription()));
        vo.setOwner(com.jianmo.platform.utils.EncodingFixer.smartFix(domain.getOwner()));
        vo.setDomainType(domain.getDomainType());
        vo.setIsActive(domain.getIsActive());
        vo.setModelQuota(domain.getModelQuota());
        vo.setPermissions(com.jianmo.platform.utils.EncodingFixer.smartFix(domain.getPermissions()));
        vo.setWorkspaceConfig(com.jianmo.platform.utils.EncodingFixer.smartFix(domain.getWorkspaceConfig()));
        vo.setUpdatedAt(domain.getUpdatedAt() != null ? domain.getUpdatedAt().toString() : null);
        return vo;
    }
}
