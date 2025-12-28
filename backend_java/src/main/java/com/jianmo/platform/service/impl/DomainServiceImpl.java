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
        if (domainRepository.existsByName(dto.getName())) {
            throw new BusinessException("领域名称已存在: " + dto.getName());
        }

        Domain domain = new Domain();
        domain.setName(dto.getName());
        domain.setDescription(dto.getDescription());
        domain.setOwner(dto.getOwner());
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

        if (dto.getName() != null) {
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
        vo.setName(domain.getName());
        vo.setDescription(domain.getDescription());
        vo.setOwner(domain.getOwner());
        vo.setUpdatedAt(domain.getUpdatedAt() != null ? domain.getUpdatedAt().toString() : null);
        return vo;
    }
}
